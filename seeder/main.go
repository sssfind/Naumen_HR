package main

import (
	"context"
	"errors"
	"fmt"
	"log"
	"math"
	"math/rand"
	"os"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"
)

type Character struct {
	FullName string
	Dept     string
	Position string
}

var characters = []Character{
	{"Ричард Хендрикс", "Backend", "Team Lead"},
	{"Бертрам Гилфойл", "DevOps", "Site Reliability Engineer"},
	{"Динеш Чугтай", "Frontend", "Senior Developer"},
	{"Джаред Данн", "Управление проектами", "Business Analyst"},
	{"Эрлих Бахман", "Маркетинг", "Product Manager"},
	{"Эллиот Алдерсон", "Информационная безопасность", "Senior Developer"},
	{"Дарлин Алдерсон", "Backend", "Middle Developer"},
	{"Тайрелл Уэллик", "Управление проектами", "Engineering Manager"},
	{"Майкл Скотт", "Управление проектами", "Project Manager"},
	{"Дуайт Шрут", "Аналитика", "Business Analyst"},
	{"Джим Халперт", "Маркетинг", "Product Manager"},
	{"Пэм Бизли", "Дизайн (UX/UI)", "UX/UI Designer"},
	{"Тоби Флендерсон", "HR", "HR Specialist"},
	{"Морис Мосс", "Служба поддержки", "System Administrator"},
	{"Рой Треннеман", "Служба поддержки", "Junior Developer"},
	{"Джен Барбер", "Управление проектами", "Project Manager"},
	{"Ричмонд Авенал", "DevOps", "Database Administrator"},
	{"Гордон Фримен", "Аналитика", "System Analyst"},
	{"Глэдос", "Информационная безопасность", "System Administrator"},
	{"Томас Андерсон", "Backend", "Middle Developer"},
	{"Тринити", "DevOps", "Site Reliability Engineer"},
	{"Макото Кусанаги", "Информационная безопасность", "Team Lead"},
	{"Лэйн Ивакура", "DevOps", "Database Administrator"},
	{"Стивен Стрэндж", "Data Science", "Data Scientist"},
	{"Тони Старк", "Backend", "Senior Developer"},
	{"Брюс Уэйн", "Аналитика", "Business Analyst"},
	{"Кларк Кент", "Служба поддержки", "Technical Writer"},
	{"Питер Паркер", "Frontend", "Junior Developer"},
	{"Уолтер Уайт", "Data Science", "Data Scientist"},
	{"Джесси Пинкман", "Тестирование", "QA Engineer"},
	{"Сол Гудман", "HR", "IT Recruiter"},
	{"Геральт из Ривии", "Тестирование", "Automation QA"},
	{"Йеннифэр из Венгерберга", "Дизайн (UX/UI)", "UX/UI Designer"},
	{"Лютик", "Служба поддержки", "Technical Writer"},
	{"Шерлок Холмс", "Аналитика", "System Analyst"},
	{"Джон Уотсон", "HR", "HR Specialist"},
	{"Сара Коннор", "Информационная безопасность", "QA Engineer"},
	{"Т-800", "Backend", "Junior Developer"},
	{"Люк Скайуокер", "Frontend", "Junior Developer"},
	{"Дарт Вейдер", "Управление проектами", "Engineering Manager"},
}

var hrCharacters = []Character{
	{"Тоби Флендерсон", "HR", "HR Business Partner"},
	{"Сол Гудман", "HR", "HR Business Partner"},
	{"Джон Уотсон", "HR", "HR Business Partner"},
}

var traineeCharacters = []Character{
	{"Питер Паркер", "Frontend", "Junior Developer"},
	{"Уолтер Уайт", "Data Science", "Data Scientist"},
	{"Томас Андерсон", "Backend", "Middle Developer"},
	{"Люк Скайуокер", "Frontend", "Junior Developer"},
	{"Джесси Пинкман", "Тестирование", "QA Engineer"},
	{"Дарлин Алдерсон", "Backend", "Middle Developer"},
	{"Т-800", "Backend", "Junior Developer"},
	{"Сара Коннор", "Информационная безопасность", "QA Engineer"},
	{"Геральт из Ривии", "Тестирование", "Automation QA"},
	{"Кларк Кент", "Служба поддержки", "Technical Writer"},
}

type feedbackSeed struct {
	WeeksAgo       int
	WeekRating     string
	TasksClarity   int
	MentorRating   int
	ResourceIssues string
	WeekComment    string
}

type traineePersona struct {
	Index            int
	WeeksEmployed    int
	Team             string
	HrIndex          int // 0..2 -> hr1..hr3
	BlockCompletion  [3]float64
	FeedbackHistory  []feedbackSeed
	SkipCurrentWeek  bool
	OverdueTaskCount int
}

type taskSpec struct {
	Block              string
	Description        string
	AcceptanceCriteria string
	Priority           string
	AcceptanceCheck    string
	DaysFromStart      int
	Status             string
	CommentAuthor      string // "trainee", "hr", ""
	CommentText        string
}

var weekComments = []string{
	"Неделя прошла продуктивно, успел закрыть учебные задачи и познакомиться с командой.",
	"Было много встреч, но к концу недели стало понятнее, чем заниматься дальше.",
	"Пока сложно ориентироваться в процессах, но наставник помогает разобраться.",
	"Доступы выдали не сразу, из-за этого задержался с первой рабочей задачей.",
	"Хороший темп: успел пройти онбординг в LMS и взять первый тикет в работу.",
	"Немного перегруз по встречам, хочется больше времени на практику.",
	"Команда очень поддерживающая, чувствую себя частью продукта.",
	"Застрял на настройке окружения, жду ответ от DevOps.",
}

func main() {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("Укажите DATABASE_URL (например: postgres://naumen:naumen@localhost:5432/naumen_hr?sslmode=disable)")
	}

	ctx := context.Background()
	pool, err := connectWithRetry(ctx, dbURL)
	if err != nil {
		log.Fatalf("Ошибка подключения к БД: %v", err)
	}
	defer pool.Close()

	if err := waitForSchema(ctx, pool); err != nil {
		log.Fatalf("Схема БД не готова: %v", err)
	}

	rng := rand.New(rand.NewSource(time.Now().UnixNano()))
	now := time.Now()

	hash, err := bcrypt.GenerateFromPassword([]byte("123123123"), bcrypt.DefaultCost)
	if err != nil {
		log.Fatalf("Ошибка генерации хэша: %v", err)
	}
	defaultHash := string(hash)

	fmt.Println("Очистка предыдущих тестовых данных...")
	if err := clearSeedData(ctx, pool); err != nil {
		log.Fatalf("Ошибка очистки: %v", err)
	}

	fmt.Println("Начинаем генерацию данных...")

	hrIDs := seedHR(ctx, pool, defaultHash)
	fmt.Printf("Создано HR-менеджеров: %d\n", len(hrIDs))

	mentorIDs := seedMentors(ctx, pool, defaultHash)
	fmt.Printf("Создано наставников: %d\n", len(mentorIDs))

	seedEmployees(ctx, pool, defaultHash, rng)
	fmt.Println("Создано сотрудников: 20")

	personas := buildPersonas(rng)
	traineeRecords := seedTrainees(ctx, pool, defaultHash, hrIDs, mentorIDs, personas, rng)
	fmt.Printf("Создано стажеров: %d\n", len(traineeRecords))

	taskCount := 0
	for _, tr := range traineeRecords {
		n := seedTasksForTrainee(ctx, pool, tr, now, rng)
		taskCount += n
		if err := recalculateProgress(ctx, pool, tr.ID); err != nil {
			log.Fatalf("Ошибка пересчёта прогресса для trainee %d: %v", tr.Index, err)
		}
	}
	fmt.Printf("Создано задач плана: %d\n", taskCount)

	seedTraineeNotifications(ctx, pool, traineeRecords)
	feedbackCount := seedFeedback(ctx, pool, traineeRecords, personas, now)
	fmt.Printf("Добавлено записей опросов: %d\n", feedbackCount)

	hrNotifCount := seedHRNotifications(ctx, pool, hrIDs, traineeRecords, personas, now, rng)
	fmt.Printf("Добавлено уведомлений HR: %d\n", hrNotifCount)

	fmt.Println("Готово. Пароль для hr*/mentor*/emp*/trainee*@naumen.ru: 123123123")
	fmt.Println("Демо: trainee1 — успешная адаптация, trainee2 — риск, trainee4 — новичок, текущий опрос не заполнен у trainee1/2.")
}

type traineeRecord struct {
	ID      int64
	Index   int
	HrID    int64
	Char    Character
	Persona traineePersona
	Team    string
}

func buildPersonas(rng *rand.Rand) []traineePersona {
	personas := []traineePersona{
		{
			Index: 1, WeeksEmployed: 8, Team: "Платформа А", HrIndex: 0,
			BlockCompletion: [3]float64{1.0, 0.75, 0.5},
			SkipCurrentWeek: true,
			FeedbackHistory: []feedbackSeed{
				{2, "GOOD", 4, 4, "ALL_OK", weekComments[0]},
				{1, "EXCELLENT", 5, 5, "ALL_OK", weekComments[4]},
			},
		},
		{
			Index: 2, WeeksEmployed: 6, Team: "Аналитика данных", HrIndex: 0,
			BlockCompletion: [3]float64{0.75, 0.5, 0.25},
			OverdueTaskCount: 2,
			FeedbackHistory: []feedbackSeed{
				{2, "OKAY_DIFFICULT", 3, 3, "ALL_OK", weekComments[2]},
				{1, "STRESSED", 2, 2, "NO_FOLDER_ACCESS", "Не хватает доступа к Confluence и репозиторию, из-за этого отстаю по задачам."},
			},
		},
		{
			Index: 3, WeeksEmployed: 4, Team: "Backend Core", HrIndex: 1,
			BlockCompletion: [3]float64{0.75, 0.33, 0.0},
			FeedbackHistory: []feedbackSeed{
				{1, "GOOD", 4, 4, "ALL_OK", weekComments[1]},
			},
		},
		{
			Index: 4, WeeksEmployed: 2, Team: "Frontend Guild", HrIndex: 1,
			BlockCompletion: [3]float64{0.25, 0.0, 0.0},
			FeedbackHistory: []feedbackSeed{},
		},
	}

	for i := 5; i <= 10; i++ {
		p := traineePersona{
			Index:           i,
			WeeksEmployed:   3 + rng.Intn(6),
			Team:            fmt.Sprintf("Команда %d", (i%4)+1),
			HrIndex:         (i - 1) % 3,
			BlockCompletion: [3]float64{rng.Float64()*0.6 + 0.2, rng.Float64() * 0.5, rng.Float64() * 0.4},
			SkipCurrentWeek: rng.Intn(3) != 0,
		}
		if i >= 8 {
			p.FeedbackHistory = []feedbackSeed{}
		} else if rng.Intn(2) == 0 {
			p.FeedbackHistory = []feedbackSeed{
				{1, "GOOD", 3 + rng.Intn(2), 3 + rng.Intn(2), "ALL_OK", weekComments[rng.Intn(len(weekComments))]},
			}
		}
		personas = append(personas, p)
	}
	return personas
}

func lookupDepartmentID(ctx context.Context, pool *pgxpool.Pool, deptName string) interface{} {
	var id int64
	err := pool.QueryRow(ctx, `
		SELECT id FROM departments WHERE name = $1 AND parent_id IS NOT NULL LIMIT 1`,
		deptName).Scan(&id)
	if err != nil {
		return nil
	}
	return id
}

func responsibilityZone(position, dept string) string {
	if position == "" {
		return fmt.Sprintf("Сотрудник направления «%s»", dept)
	}
	return fmt.Sprintf("%s · направление «%s»", position, dept)
}

func seedHR(ctx context.Context, pool *pgxpool.Pool, passwordHash string) []int64 {
	ids := make([]int64, 0, 3)
	for i, c := range hrCharacters {
		var id int64
		phone := fmt.Sprintf("+7991%07d", 1000000+i*137)
		hrDeptID := lookupDepartmentID(ctx, pool, "HR")
		zone := responsibilityZone(c.Position, "HR")
		err := pool.QueryRow(ctx, `
			INSERT INTO users (
				email, password_hash, full_name, department, department_id, role,
				phone, position, team, responsibility_zone, is_active
			)
			VALUES ($1, $2, $3, 'HR', $4, 'ROLE_HR', $5, $6, 'HR Operations', $7, true)
			ON CONFLICT (email) DO UPDATE SET
				password_hash = EXCLUDED.password_hash,
				full_name = EXCLUDED.full_name,
				department = EXCLUDED.department,
				department_id = EXCLUDED.department_id,
				role = EXCLUDED.role,
				phone = EXCLUDED.phone,
				position = EXCLUDED.position,
				team = EXCLUDED.team,
				responsibility_zone = EXCLUDED.responsibility_zone,
				is_active = true
			RETURNING id`,
			fmt.Sprintf("hr%d@naumen.ru", i+1), passwordHash, c.FullName, hrDeptID, phone, c.Position, zone).Scan(&id)
		if err != nil {
			log.Fatalf("Ошибка вставки HR: %v", err)
		}
		ids = append(ids, id)
	}
	return ids
}

func seedMentors(ctx context.Context, pool *pgxpool.Pool, passwordHash string) []int64 {
	names := []struct {
		FullName string
		Position string
		Dept     string
	}{
		{"Петров Алексей Сергеевич", "Tech Lead", "Разработка"},
		{"Соколова Мария Игоревна", "Senior QA", "Тестирование"},
	}
	ids := make([]int64, 0, len(names))
	for i, m := range names {
		var id int64
		phone := fmt.Sprintf("+7994%07d", 4000000+i*211)
		deptID := lookupDepartmentID(ctx, pool, m.Dept)
		zone := responsibilityZone(m.Position, m.Dept)
		err := pool.QueryRow(ctx, `
			INSERT INTO users (
				email, password_hash, full_name, department, department_id, role,
				phone, position, team, responsibility_zone, is_active
			)
			VALUES ($1, $2, $3, $4, $5, 'ROLE_MENTOR', $6, $7, $8, $9, true)
			ON CONFLICT (email) DO UPDATE SET
				password_hash = EXCLUDED.password_hash,
				full_name = EXCLUDED.full_name,
				department = EXCLUDED.department,
				department_id = EXCLUDED.department_id,
				role = EXCLUDED.role,
				phone = EXCLUDED.phone,
				position = EXCLUDED.position,
				team = EXCLUDED.team,
				responsibility_zone = EXCLUDED.responsibility_zone,
				is_active = true
			RETURNING id`,
			fmt.Sprintf("mentor%d@naumen.ru", i+1), passwordHash, m.FullName, m.Dept, deptID,
			phone, m.Position, m.Dept, zone).Scan(&id)
		if err != nil {
			log.Fatalf("Ошибка вставки наставника: %v", err)
		}
		ids = append(ids, id)
	}
	return ids
}

func seedEmployees(ctx context.Context, pool *pgxpool.Pool, passwordHash string, rng *rand.Rand) {
	teams := []string{"Платформа А", "Аналитика данных", "Backend Core", "Frontend Guild", "Команда 2", "Команда 3"}
	teamByTrainee := map[int]string{
		1: "Платформа А",
		2: "Аналитика данных",
		3: "Backend Core",
		4: "Frontend Guild",
	}

	shuffled := make([]Character, len(characters))
	copy(shuffled, characters)
	rng.Shuffle(len(shuffled), func(i, j int) { shuffled[i], shuffled[j] = shuffled[j], shuffled[i] })

	idx := 0
	for i := 1; i <= 20; i++ {
		c := shuffled[idx%len(shuffled)]
		idx++
		team := teams[rng.Intn(len(teams))]
		if t, ok := teamByTrainee[(i%10)+1]; ok && i <= 4 {
			team = t
		}
		phone := fmt.Sprintf("+7992%07d", 2000000+i*97)
		deptID := lookupDepartmentID(ctx, pool, c.Dept)
		zone := responsibilityZone(c.Position, c.Dept)
		_, err := pool.Exec(ctx, `
			INSERT INTO users (
				email, password_hash, full_name, department, department_id, role,
				position, phone, team, responsibility_zone, is_active
			)
			VALUES ($1, $2, $3, $4, $5, 'ROLE_EMPLOYEE', $6, $7, $8, $9, true)
			ON CONFLICT (email) DO UPDATE SET
				password_hash = EXCLUDED.password_hash,
				full_name = EXCLUDED.full_name,
				department = EXCLUDED.department,
				department_id = EXCLUDED.department_id,
				role = EXCLUDED.role,
				position = EXCLUDED.position,
				phone = EXCLUDED.phone,
				team = EXCLUDED.team,
				responsibility_zone = EXCLUDED.responsibility_zone,
				is_active = true`,
			fmt.Sprintf("emp%d@naumen.ru", i), passwordHash, c.FullName, c.Dept, deptID, c.Position, phone, team, zone)
		if err != nil {
			log.Fatalf("Ошибка вставки сотрудника %d: %v", i, err)
		}
	}
}

func seedTrainees(ctx context.Context, pool *pgxpool.Pool, passwordHash string, hrIDs []int64, mentorIDs []int64, personas []traineePersona, rng *rand.Rand) []traineeRecord {
	records := make([]traineeRecord, 0, len(personas))
	extraChars := make([]Character, len(characters))
	copy(extraChars, characters)
	rng.Shuffle(len(extraChars), func(i, j int) { extraChars[i], extraChars[j] = extraChars[j], extraChars[i] })

	for _, p := range personas {
		c := traineeCharacters[p.Index-1]
		if p.Index > 4 {
			c = extraChars[(p.Index-5)%len(extraChars)]
		}
		hrID := hrIDs[p.HrIndex%len(hrIDs)]
		mentorID := mentorIDs[p.HrIndex%len(mentorIDs)]
		phone := fmt.Sprintf("+7993%07d", 3000000+p.Index*211)
		var id int64
		deptID := lookupDepartmentID(ctx, pool, c.Dept)
		zone := responsibilityZone(c.Position, c.Dept)
		err := pool.QueryRow(ctx, `
			INSERT INTO users (
				email, password_hash, full_name, department, department_id, role,
				hr_id, mentor_id, team, phone, position, responsibility_zone, mood_level,
				progress_block_one, progress_block_two, progress_block_three, is_active
			)
			VALUES ($1, $2, $3, $4, $5, 'ROLE_TRAINEE', $6, $7, $8, $9, $10, $11, 3, 0, 0, 0, true)
			ON CONFLICT (email) DO UPDATE SET
				password_hash = EXCLUDED.password_hash,
				full_name = EXCLUDED.full_name,
				department = EXCLUDED.department,
				department_id = EXCLUDED.department_id,
				role = EXCLUDED.role,
				hr_id = EXCLUDED.hr_id,
				mentor_id = EXCLUDED.mentor_id,
				team = EXCLUDED.team,
				phone = EXCLUDED.phone,
				position = EXCLUDED.position,
				responsibility_zone = EXCLUDED.responsibility_zone,
				mood_level = 3,
				progress_block_one = 0,
				progress_block_two = 0,
				progress_block_three = 0,
				is_active = true
			RETURNING id`,
			fmt.Sprintf("trainee%d@naumen.ru", p.Index), passwordHash, c.FullName, c.Dept, deptID,
			hrID, mentorID, p.Team, phone, c.Position, zone).Scan(&id)
		if err != nil {
			log.Fatalf("Ошибка вставки стажера %d: %v", p.Index, err)
		}
		records = append(records, traineeRecord{
			ID: id, Index: p.Index, HrID: hrID, Char: c, Persona: p, Team: p.Team,
		})
	}
	return records
}

func tasksForPersona(tr Character, p traineePersona, rng *rand.Rand) []taskSpec {
	dept := tr.Dept
	tasks := []taskSpec{
		{"ONBOARDING", "Пройти вводный курс в LMS и сдать итоговый тест", "Тест пройден с результатом не ниже 80%", "HIGH", "MACHINE", 7, "", "", ""},
		{"ONBOARDING", "Встреча 1:1 с HR-куратором: цели испытательного срока", "Встреча проведена, цели зафиксированы в профиле", "HIGH", "USER", 10, "", "", ""},
		{"ONBOARDING", fmt.Sprintf("Знакомство с командой %s: встречи с тимлидом и buddy", p.Team), "Проведены минимум 2 встречи, есть заметки", "MEDIUM", "USER", 14, "", "", ""},
		{"ONBOARDING", "Изучить регламенты отдела «" + dept + "» на портале", "Отмечены прочитанными ключевые документы", "MEDIUM", "MACHINE", 21, "", "", ""},
		{"SKILLS", "Настроить локальное окружение и получить доступ к репозиторию", "Сборка проходит, доступ к Git есть", "HIGH", "USER", 28, "", "", ""},
		{"SKILLS", "Разобрать архитектуру основного сервиса по внутренней wiki", "Есть конспект или комментарии к схеме", "MEDIUM", "USER", 35, "", "", ""},
		{"SKILLS", "Выполнить учебную задачу по code style и пройти review", "PR принят без блокирующих замечаний", "MEDIUM", "USER", 42, "", "", ""},
		{"WORK", "Взять в работу первый тикет из бэклога команды (низкая сложность)", "Тикет переведён в Done", "HIGH", "USER", 49, "", "", ""},
		{"WORK", "Участвовать в daily и фиксировать статус в трекере", "Не менее 5 dailies за 2 недели", "MEDIUM", "MACHINE", 56, "", "", ""},
		{"WORK", "Подготовить мини-демо результата за период адаптации", "Демо проведено для команды", "MEDIUM", "USER", 63, "", "", ""},
	}

	if p.WeeksEmployed <= 2 {
		tasks = tasks[:6]
	}

	assignStatusesPerBlock(tasks, p.BlockCompletion, rng)
	overdueLeft := p.OverdueTaskCount
	for i := range tasks {
		if overdueLeft > 0 && tasks[i].Status != "COMPLETED" && tasks[i].DaysFromStart < p.WeeksEmployed*7-7 {
			tasks[i].DaysFromStart = p.WeeksEmployed*7 - 14
			overdueLeft--
		}
	}

	// Комментарии к части задач
	for i := range tasks {
		if tasks[i].Status == "IN_PROGRESS" && rng.Intn(3) == 0 {
			tasks[i].CommentAuthor = "trainee"
			tasks[i].CommentText = "Уточняю детали по доступам, двигаюсь по чек-листу."
		}
		if tasks[i].Status == "COMPLETED" && i%3 == 0 {
			tasks[i].CommentAuthor = "hr"
			tasks[i].CommentText = "Отлично, переходим к следующему этапу."
		}
	}
	if p.Index == 2 && len(tasks) > 4 {
		tasks[4].CommentAuthor = "trainee"
		tasks[4].CommentText = "Жду выдачу доступа к Confluence, без него сложно закрыть задачу."
	}

	return tasks
}

func assignStatusesPerBlock(tasks []taskSpec, blocks [3]float64, rng *rand.Rand) {
	blockOrder := []string{"ONBOARDING", "SKILLS", "WORK"}
	for bi, blockName := range blockOrder {
		var indices []int
		for i, t := range tasks {
			if t.Block == blockName {
				indices = append(indices, i)
			}
		}
		statuses := assignStatuses(len(indices), blocks[bi], rng)
		for j, idx := range indices {
			tasks[idx].Status = statuses[j]
		}
	}
}

func assignStatuses(n int, rate float64, rng *rand.Rand) []string {
	if n == 0 {
		return nil
	}
	completed := int(math.Round(float64(n) * rate))
	if completed > n {
		completed = n
	}
	inProgress := 0
	if completed < n && rate > 0.05 {
		inProgress = 1
	}
	if completed+inProgress > n {
		inProgress = n - completed
	}
	out := make([]string, n)
	for i := 0; i < completed; i++ {
		out[i] = "COMPLETED"
	}
	for i := completed; i < completed+inProgress; i++ {
		out[i] = "IN_PROGRESS"
	}
	for i := completed + inProgress; i < n; i++ {
		out[i] = "NOT_STARTED"
	}
	rng.Shuffle(len(out), func(i, j int) { out[i], out[j] = out[j], out[i] })
	return out
}

func seedTasksForTrainee(ctx context.Context, pool *pgxpool.Pool, tr traineeRecord, now time.Time, rng *rand.Rand) int {
	if _, err := pool.Exec(ctx, `DELETE FROM trainee_plan_tasks WHERE trainee_id = $1`, tr.ID); err != nil {
		log.Fatalf("Ошибка очистки задач trainee%d: %v", tr.Index, err)
	}

	start := now.AddDate(0, 0, -tr.Persona.WeeksEmployed*7)
	specs := tasksForPersona(tr.Char, tr.Persona, rng)
	count := 0

	for _, spec := range specs {
		deadline := start.AddDate(0, 0, spec.DaysFromStart)
		var startedAt, completedAt *time.Time
		if spec.Status == "IN_PROGRESS" || spec.Status == "COMPLETED" {
			s := deadline.AddDate(0, 0, -3)
			if s.Before(start) {
				s = start.Add(24 * time.Hour)
			}
			startedAt = &s
		}
		if spec.Status == "COMPLETED" {
			c := deadline
			if c.After(now) {
				c = now.AddDate(0, 0, -1)
			}
			completedAt = &c
		}

		isMilestone := spec.DaysFromStart == 7 || spec.DaysFromStart == 21 || spec.DaysFromStart == 42 ||
			spec.DaysFromStart == 63 || spec.DaysFromStart == 84

		var taskID int64
		err := pool.QueryRow(ctx, `
			INSERT INTO trainee_plan_tasks (
				trainee_id, block, description, deadline, priority,
				acceptance_criteria, acceptance_check_type, status, started_at, completed_at, is_milestone
			) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
			RETURNING id`,
			tr.ID, spec.Block, spec.Description, deadline.Format("2006-01-02"),
			spec.Priority, spec.AcceptanceCriteria, spec.AcceptanceCheck,
			spec.Status, startedAt, completedAt, isMilestone).Scan(&taskID)
		if err != nil {
			log.Fatalf("Ошибка вставки задачи для trainee%d: %v", tr.Index, err)
		}
		count++

		if spec.CommentText != "" {
			authorID := tr.ID
			if spec.CommentAuthor == "hr" {
				authorID = tr.HrID
			}
			commentTime := now.AddDate(0, 0, -rng.Intn(5)-1)
			_, err = pool.Exec(ctx, `
				INSERT INTO trainee_plan_task_comments (task_id, author_id, text, created_at)
				VALUES ($1, $2, $3, $4)`,
				taskID, authorID, spec.CommentText, commentTime)
			if err != nil {
				log.Fatalf("Ошибка вставки комментария: %v", err)
			}
		}
	}

	_, err := pool.Exec(ctx, `
		UPDATE users SET adaptation_start_date = $1 WHERE id = $2`,
		start.Format("2006-01-02"), tr.ID)
	if err != nil {
		log.Fatalf("adaptation_start_date trainee%d: %v", tr.Index, err)
	}

	return count
}

func recalculateProgress(ctx context.Context, pool *pgxpool.Pool, traineeID int64) error {
	blocks := []string{"ONBOARDING", "SKILLS", "WORK"}
	cols := []string{"progress_block_one", "progress_block_two", "progress_block_three"}
	for i, block := range blocks {
		var total, completed int
		err := pool.QueryRow(ctx, `
			SELECT COUNT(*),
			       COUNT(*) FILTER (WHERE status = 'COMPLETED')
			FROM trainee_plan_tasks
			WHERE trainee_id = $1 AND block = $2`, traineeID, block).Scan(&total, &completed)
		if err != nil {
			return err
		}
		progress := 0
		if total > 0 {
			progress = int(math.Round(float64(completed) * 100.0 / float64(total)))
		}
		_, err = pool.Exec(ctx, fmt.Sprintf(`UPDATE users SET %s = $1 WHERE id = $2`, cols[i]), progress, traineeID)
		if err != nil {
			return err
		}
	}
	return recalculateMoodFromFeedback(ctx, pool, traineeID)
}

func seedTraineeNotifications(ctx context.Context, pool *pgxpool.Pool, trainees []traineeRecord) {
	for _, tr := range trainees {
		created := time.Now().AddDate(0, 0, -tr.Persona.WeeksEmployed*7+1)
		_, err := pool.Exec(ctx, `
			INSERT INTO notifications (user_id, title, message, type, is_read, created_at)
			VALUES ($1, 'Назначен HR-куратор', 'Вам назначен куратор адаптации. Загляните в профиль.', 'TRAINEE_ASSIGNED', false, $2)`,
			tr.ID, created)
		if err != nil {
			log.Fatalf("Ошибка уведомления стажёра: %v", err)
		}
		if len(tr.Persona.FeedbackHistory) > 0 {
			_, err = pool.Exec(ctx, `
				INSERT INTO notifications (user_id, title, message, type, is_read, created_at)
				VALUES ($1, 'Опрос сохранён', 'Спасибо! Ваш еженедельный опрос учтён.', 'FEEDBACK_SUBMITTED', true, $2)`,
				tr.ID, time.Now().AddDate(0, 0, -3))
			if err != nil {
				log.Fatalf("Ошибка уведомления стажёра: %v", err)
			}
		}
	}
	fmt.Println("Уведомления стажёрам добавлены.")
}

func seedFeedback(ctx context.Context, pool *pgxpool.Pool, trainees []traineeRecord, personas []traineePersona, now time.Time) int {
	weekStart := mondayOfWeek(now)
	count := 0
	personaByIndex := make(map[int]traineePersona)
	for _, p := range personas {
		personaByIndex[p.Index] = p
	}
	for _, tr := range trainees {
		p := personaByIndex[tr.Index]
		for _, fb := range p.FeedbackHistory {
			ws := weekStart.AddDate(0, 0, -7*fb.WeeksAgo)
			_, err := pool.Exec(ctx, `
				INSERT INTO feedback_responses (
					trainee_id, week_start, week_rating, tasks_clarity,
					resource_issues, mentor_rating, week_comment, created_at
				) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
				ON CONFLICT (trainee_id, week_start) DO NOTHING`,
				tr.ID, ws.Format("2006-01-02"), fb.WeekRating, fb.TasksClarity,
				fb.ResourceIssues, fb.MentorRating, fb.WeekComment, ws.Add(48*time.Hour))
			if err != nil {
				log.Fatalf("Ошибка feedback: %v", err)
			}
			count++
		}
		if err := recalculateMoodFromFeedback(ctx, pool, tr.ID); err != nil {
			log.Fatalf("Ошибка mood_level: %v", err)
		}
	}
	return count
}

func recalculateMoodFromFeedback(ctx context.Context, pool *pgxpool.Pool, traineeID int64) error {
	var rating string
	err := pool.QueryRow(ctx, `
		SELECT week_rating FROM feedback_responses
		WHERE trainee_id = $1 ORDER BY week_start DESC LIMIT 1`, traineeID).Scan(&rating)
	if err != nil {
		return nil
	}
	mood := weekRatingToMood(rating)
	_, err = pool.Exec(ctx, `UPDATE users SET mood_level = $1 WHERE id = $2`, mood, traineeID)
	return err
}

func weekRatingToMood(r string) int {
	switch r {
	case "EXCELLENT":
		return 5
	case "GOOD":
		return 4
	case "OKAY_DIFFICULT":
		return 3
	case "STRESSED":
		return 2
	case "NEED_HELP":
		return 1
	default:
		return 3
	}
}

func seedHRNotifications(ctx context.Context, pool *pgxpool.Pool, hrIDs []int64, trainees []traineeRecord, personas []traineePersona, now time.Time, rng *rand.Rand) int {
	count := 0
	personaByIndex := make(map[int]traineePersona)
	for _, p := range personas {
		personaByIndex[p.Index] = p
	}

	for _, tr := range trainees {
		p := personaByIndex[tr.Index]
		hrID := tr.HrID

		if p.Index == 2 {
			_, err := pool.Exec(ctx, `
				INSERT INTO notifications (user_id, title, message, type, is_read, created_at)
				VALUES ($1, 'Внимание: риск по адаптации', $2, 'FEEDBACK_RISK', false, $3)`,
				hrID, tr.Char.FullName+": низкая понятность задач, проблемы с доступами", now.AddDate(0, 0, -1))
			if err != nil {
				log.Fatalf("Ошибка HR уведомления: %v", err)
			}
			count++
		}

		if len(p.FeedbackHistory) > 0 {
			_, err := pool.Exec(ctx, `
				INSERT INTO notifications (user_id, title, message, type, is_read, created_at)
				VALUES ($1, 'Новый опрос стажёра', $2, 'FEEDBACK_SUBMITTED', $3, $4)`,
				hrID, tr.Char.FullName+" заполнил еженедельный опрос", rng.Intn(2) == 0, now.AddDate(0, 0, -2))
			if err != nil {
				log.Fatalf("Ошибка HR уведомления: %v", err)
			}
			count++
		}

		if p.BlockCompletion[2] >= 0.25 || p.Index == 1 {
			_, err := pool.Exec(ctx, `
				INSERT INTO notifications (user_id, title, message, type, is_read, created_at)
				VALUES ($1, 'Стажёр завершил задачу', $2, 'TASK_COMPLETED', true, $3)`,
				hrID, tr.Char.FullName+" завершил задачу в блоке «Рабочие задачи»", now.AddDate(0, 0, -4))
			if err != nil {
				log.Fatalf("Ошибка HR уведомления: %v", err)
			}
			count++
		}
	}
	return count
}

func mondayOfWeek(t time.Time) time.Time {
	wd := int(t.Weekday())
	if wd == 0 {
		wd = 7
	}
	start := time.Date(t.Year(), t.Month(), t.Day(), 0, 0, 0, 0, t.Location())
	return start.AddDate(0, 0, -(wd - 1))
}

func connectWithRetry(ctx context.Context, dbURL string) (*pgxpool.Pool, error) {
	const attempts = 30
	var lastErr error
	for i := 1; i <= attempts; i++ {
		pool, err := pgxpool.New(ctx, dbURL)
		if err != nil {
			lastErr = err
		} else if err = pool.Ping(ctx); err != nil {
			pool.Close()
			lastErr = err
		} else {
			return pool, nil
		}
		log.Printf("Ожидание БД (%d/%d)...", i, attempts)
		time.Sleep(2 * time.Second)
	}
	return nil, lastErr
}

func waitForSchema(ctx context.Context, pool *pgxpool.Pool) error {
	const attempts = 60
	for i := 1; i <= attempts; i++ {
		if schemaReady(ctx, pool) {
			return nil
		}
		log.Printf("Ожидание миграций (%d/%d)...", i, attempts)
		time.Sleep(2 * time.Second)
	}
	return errors.New("таблицы users/notifications/feedback_responses/trainee_plan_tasks не найдены — дождитесь запуска backend (Flyway)")
}

func schemaReady(ctx context.Context, pool *pgxpool.Pool) bool {
	tables := []string{
		"users", "departments", "notifications", "feedback_responses",
		"trainee_plan_tasks", "trainee_plan_task_comments",
	}
	for _, table := range tables {
		var exists bool
		err := pool.QueryRow(ctx, `
			SELECT EXISTS (
				SELECT 1 FROM information_schema.tables
				WHERE table_schema = 'public' AND table_name = $1
			)`, table).Scan(&exists)
		if err != nil || !exists {
			return false
		}
	}
	return true
}

func clearSeedData(ctx context.Context, pool *pgxpool.Pool) error {
	const (
		seedUsers     = `email ~ '^(hr|emp|trainee|mentor)[0-9]+@naumen\.ru$'`
		seedTrainees  = `email ~ '^trainee[0-9]+@naumen\.ru$'`
		seedStaff     = `email ~ '^(hr|emp|mentor)[0-9]+@naumen\.ru$'`
		seedUsersSubq = `SELECT id FROM users WHERE ` + seedUsers
	)

	_, err := pool.Exec(ctx, fmt.Sprintf(`
		DELETE FROM trainee_plan_task_comments
		WHERE task_id IN (
			SELECT id FROM trainee_plan_tasks WHERE trainee_id IN (
				SELECT id FROM users WHERE %s))`, seedTrainees))
	if err != nil {
		return fmt.Errorf("trainee_plan_task_comments: %w", err)
	}

	_, err = pool.Exec(ctx, fmt.Sprintf(`
		DELETE FROM trainee_plan_tasks
		WHERE trainee_id IN (SELECT id FROM users WHERE %s)`, seedTrainees))
	if err != nil {
		return fmt.Errorf("trainee_plan_tasks: %w", err)
	}

	_, err = pool.Exec(ctx, fmt.Sprintf(`
		DELETE FROM feedback_responses
		WHERE trainee_id IN (SELECT id FROM users WHERE %s)`, seedTrainees))
	if err != nil {
		return fmt.Errorf("feedback_responses: %w", err)
	}

	_, err = pool.Exec(ctx, fmt.Sprintf(`
		DELETE FROM notifications
		WHERE user_id IN (%s)`, seedUsersSubq))
	if err != nil {
		return fmt.Errorf("notifications: %w", err)
	}

	_, err = pool.Exec(ctx, fmt.Sprintf(`
		UPDATE users SET hr_id = NULL
		WHERE hr_id IN (%s)`, seedUsersSubq))
	if err != nil {
		return fmt.Errorf("users.hr_id: %w", err)
	}

	_, err = pool.Exec(ctx, fmt.Sprintf(`
		UPDATE users SET mentor_id = NULL
		WHERE mentor_id IN (%s)`, seedUsersSubq))
	if err != nil {
		return fmt.Errorf("users.mentor_id: %w", err)
	}

	tagTrainees, err := pool.Exec(ctx, fmt.Sprintf(`DELETE FROM users WHERE %s`, seedTrainees))
	if err != nil {
		return fmt.Errorf("users trainees: %w", err)
	}

	tagStaff, err := pool.Exec(ctx, fmt.Sprintf(`DELETE FROM users WHERE %s`, seedStaff))
	if err != nil {
		return fmt.Errorf("users staff: %w", err)
	}

	total := tagTrainees.RowsAffected() + tagStaff.RowsAffected()
	fmt.Printf("Удалено тестовых пользователей: %d (стажёры: %d, hr/mentor/emp: %d)\n",
		total, tagTrainees.RowsAffected(), tagStaff.RowsAffected())
	return nil
}
