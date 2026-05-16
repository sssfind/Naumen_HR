package main

import (
	"context"
	"errors"
	"fmt"
	"log"
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

	shuffledChars := make([]Character, len(characters))
	copy(shuffledChars, characters)
	rng.Shuffle(len(shuffledChars), func(i, j int) {
		shuffledChars[i], shuffledChars[j] = shuffledChars[j], shuffledChars[i]
	})

	charIndex := 0
	nextChar := func() Character {
		c := shuffledChars[charIndex%len(shuffledChars)]
		charIndex++
		return c
	}

	hrIDs := make([]int64, 0, 3)
	for i := 1; i <= 3; i++ {
		var id int64
		email := fmt.Sprintf("hr%d@naumen.ru", i)
		c := nextChar()
		
		err := pool.QueryRow(ctx, `
			INSERT INTO users (email, password_hash, full_name, department, role, phone, position)
			VALUES ($1, $2, $3, $4, 'ROLE_HR', '+79990000001', 'HR Business Partner')
			RETURNING id`,
			email, defaultHash, c.FullName, "HR").Scan(&id)
		if err != nil {
			log.Fatalf("Ошибка вставки HR: %v", err)
		}
		hrIDs = append(hrIDs, id)
	}
	fmt.Printf("Создано HR-менеджеров: %d\n", len(hrIDs))

	for i := 1; i <= 20; i++ {
		email := fmt.Sprintf("emp%d@naumen.ru", i)
		c := nextChar()

		_, err := pool.Exec(ctx, `
			INSERT INTO users (email, password_hash, full_name, department, role, position)
			VALUES ($1, $2, $3, $4, 'ROLE_EMPLOYEE', $5)`,
			email, defaultHash, c.FullName, c.Dept, c.Position)
		if err != nil {
			log.Fatalf("Ошибка вставки сотрудника %s: %v", email, err)
		}
	}
	fmt.Println("Создано сотрудников: 20")

	traineeIDs := make([]int64, 0, 10)
	for i := 1; i <= 10; i++ {
		var id int64
		email := fmt.Sprintf("trainee%d@naumen.ru", i)
		hrID := hrIDs[rng.Intn(len(hrIDs))]
		c := nextChar()

		err := pool.QueryRow(ctx, `
			INSERT INTO users (
				email, password_hash, full_name, department, role,
				hr_id, team, mood_level,
				progress_block_one, progress_block_two, progress_block_three
			)
			VALUES ($1, $2, $3, $4, 'ROLE_TRAINEE', $5, $6, $7, $8, $9, $10)
			RETURNING id`,
			email, defaultHash, c.FullName, c.Dept, hrID, c.Dept,
			rng.Intn(5)+1, rng.Intn(101), rng.Intn(101), rng.Intn(101)).Scan(&id)
		if err != nil {
			log.Fatalf("Ошибка вставки стажера %s: %v", email, err)
		}
		traineeIDs = append(traineeIDs, id)
	}
	fmt.Printf("Создано стажеров: %d\n", len(traineeIDs))

	for _, tID := range traineeIDs {
		_, err := pool.Exec(ctx, `
			INSERT INTO notifications (user_id, title, message, type)
			VALUES ($1, 'Назначен HR-куратор', 'У вас появился куратор, проверьте профиль.', 'TRAINEE_ASSIGNED')`,
			tID)
		if err != nil {
			log.Fatalf("Ошибка вставки уведомления: %v", err)
		}
	}
	fmt.Println("Уведомления разосланы.")

	weekStart := mondayOfWeek(time.Now())
	for i, tID := range traineeIDs {
		for w := 1; w <= 2; w++ {
			if i >= 7 && w == 1 {
				continue
			}
			pastWeek := weekStart.AddDate(0, 0, -7*w)
			ratings := []string{"EXCELLENT", "GOOD", "OKAY_DIFFICULT", "STRESSED", "NEED_HELP"}
			weekRating := ratings[rng.Intn(len(ratings))]
			clarity := rng.Intn(3) + 3
			mentor := rng.Intn(3) + 3
			resources := "ALL_OK"
			if rng.Intn(4) == 0 {
				resources = "NO_FOLDER_ACCESS"
			}
			_, err := pool.Exec(ctx, `
				INSERT INTO feedback_responses (
					trainee_id, week_start, week_rating, tasks_clarity,
					resource_issues, mentor_rating, week_comment
				) VALUES ($1, $2, $3, $4, $5, $6, $7)
				ON CONFLICT (trainee_id, week_start) DO NOTHING`,
				tID, pastWeek.Format("2006-01-02"), weekRating, clarity, resources, mentor,
				"Тестовый отзыв из seeder")
			if err != nil {
				log.Fatalf("Ошибка вставки feedback: %v", err)
			}
		}
	}
	fmt.Println("Добавлена история еженедельных опросов.")
	fmt.Println("Готово. Пароль для hr*/emp*/trainee*@naumen.ru: 123123123")
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
	return errors.New("таблицы users/notifications/feedback_responses не найдены — дождитесь запуска backend (Flyway)")
}

func schemaReady(ctx context.Context, pool *pgxpool.Pool) bool {
	for _, table := range []string{"users", "notifications", "feedback_responses"} {
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
	_, err := pool.Exec(ctx, `
		DELETE FROM feedback_responses
		WHERE trainee_id IN (
			SELECT id FROM users
			WHERE email ~ '^(hr|emp|trainee)[0-9]+@naumen\.ru$'
		)`)
	if err != nil {
		return fmt.Errorf("feedback_responses: %w", err)
	}
	_, err = pool.Exec(ctx, `
		DELETE FROM notifications
		WHERE user_id IN (
			SELECT id FROM users
			WHERE email ~ '^(hr|emp|trainee)[0-9]+@naumen\.ru$'
		)`)
	if err != nil {
		return fmt.Errorf("notifications: %w", err)
	}
	tag, err := pool.Exec(ctx, `
		DELETE FROM users
		WHERE email ~ '^(hr|emp|trainee)[0-9]+@naumen\.ru$'`)
	if err != nil {
		return fmt.Errorf("users: %w", err)
	}
	fmt.Printf("Удалено тестовых пользователей: %d\n", tag.RowsAffected())
	return nil
}