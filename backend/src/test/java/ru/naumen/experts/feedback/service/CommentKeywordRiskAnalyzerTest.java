package ru.naumen.experts.feedback.service;

import org.junit.jupiter.api.Test;
import ru.naumen.experts.feedback.enums.CommentRiskFlag;
import ru.naumen.experts.feedback.enums.CommentSentiment;

import static org.assertj.core.api.Assertions.assertThat;

class CommentKeywordRiskAnalyzerTest {

    @Test
    void detectsStressKeywords() {
        var result = CommentKeywordRiskAnalyzer.analyze("На этой неделе сильный стресс, не справляюсь с объёмом");

        assertThat(result).isNotNull();
        assertThat(result.riskFlags()).contains(CommentRiskFlag.STRESS);
        assertThat(result.sentiment()).isIn(CommentSentiment.MIXED, CommentSentiment.NEGATIVE);
    }

    @Test
    void neutralCommentHasNoFlags() {
        var result = CommentKeywordRiskAnalyzer.analyze("Всё нормально, продолжаю работать над задачами");

        assertThat(result).isNotNull();
        assertThat(result.riskFlags()).isEmpty();
    }
}
