-- Русские названия экспертных навыков (отображение в карточке, поиске, справочниках)
UPDATE skills SET name = 'Публичные выступления' WHERE category = 'EXPERT' AND name = 'Public Speaking';
UPDATE skills SET name = 'Менторинг' WHERE category = 'EXPERT' AND name = 'Mentoring';
UPDATE skills SET name = 'Работа в жюри' WHERE category = 'EXPERT' AND name = 'Jury Work';
UPDATE skills SET name = 'Лекции' WHERE category = 'EXPERT' AND name = 'Lecture Delivery';
UPDATE skills SET name = 'Фасилитация' WHERE category = 'EXPERT' AND name = 'Facilitation';
