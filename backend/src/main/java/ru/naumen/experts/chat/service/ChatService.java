package ru.naumen.experts.chat.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import ru.naumen.experts.chat.config.OpenRouterProperties;
import ru.naumen.experts.chat.dto.ChatRequest;
import ru.naumen.experts.chat.dto.ChatResponse;
import ru.naumen.experts.chat.dto.OpenRouterChatRequest;
import ru.naumen.experts.chat.dto.OpenRouterChatResponse;
import ru.naumen.experts.exception.BadRequestException;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

    private static final String SYSTEM_PROMPT = """
            Ты чат-бот внутренней HR-системы NAU-START.
            Отвечай кратко, дружелюбно и по-русски.
            Помогай с простыми рабочими и HR-вопросами: как оформить отпуск, где найти регламент,
            как заказать пропуск, как работать с планом стажировки, задачами, профилем и опросами.
            Если точный процесс зависит от компании или внутреннего портала, честно скажи,
            что нужно уточнить у HR или руководителя, и дай общий порядок действий.
            Не выдумывай конкретные ссылки, номера кабинетов, имена сотрудников или правила,
            если пользователь их не дал.
            """;

    private final RestClient openRouterRestClient;
    private final OpenRouterProperties properties;

    public ChatResponse ask(ChatRequest request, String userRole) {
        if (properties.apiKey() == null || properties.apiKey().isBlank()) {
            throw new BadRequestException("Не настроен API-ключ OpenRouter");
        }
        if (properties.model() == null || properties.model().isBlank()) {
            throw new BadRequestException("Не настроена модель OpenRouter");
        }

        String message = request.getMessage().trim();

        List<OpenRouterChatRequest.Message> messages = new ArrayList<>();
        messages.add(new OpenRouterChatRequest.Message("system", SYSTEM_PROMPT));
        messages.add(new OpenRouterChatRequest.Message("system", "Роль пользователя в системе: " + userRole));

        if (request.getHistory() != null && !request.getHistory().isEmpty()) {
            int skip = Math.max(0, request.getHistory().size() - 10);
            request.getHistory().stream()
                    .skip(skip)
                    .filter(h -> h.getRole() != null && h.getContent() != null && !h.getContent().isBlank())
                    .map(h -> new OpenRouterChatRequest.Message(h.getRole(), h.getContent().trim()))
                    .forEach(messages::add);
        }

        messages.add(new OpenRouterChatRequest.Message("user", message));

        OpenRouterChatRequest openRouterRequest = new OpenRouterChatRequest(
                properties.model(),
                messages,
                0.2,
                600
        );

        OpenRouterChatResponse response = sendOpenRouterRequest(openRouterRequest);

        String reply = extractReply(response);
        return ChatResponse.builder().reply(reply).build();
    }

    private OpenRouterChatResponse sendOpenRouterRequest(OpenRouterChatRequest request) {
        try {
            return openRouterRestClient.post()
                    .uri("/chat/completions")
                    .body(request)
                    .retrieve()
                    .body(OpenRouterChatResponse.class);
        } catch (RestClientResponseException ex) {
            log.warn("OpenRouter request failed with status {}: {}", ex.getStatusCode(), ex.getResponseBodyAsString());
            throw new BadRequestException(resolveOpenRouterErrorMessage(ex));
        } catch (ResourceAccessException ex) {
            log.warn("OpenRouter is unavailable", ex);
            throw new BadRequestException("OpenRouter сейчас недоступен. Попробуйте позже");
        }
    }

    private String resolveOpenRouterErrorMessage(RestClientResponseException ex) {
        HttpStatus status = HttpStatus.resolve(ex.getStatusCode().value());
        if (status == HttpStatus.UNAUTHORIZED || status == HttpStatus.FORBIDDEN) {
            return "OpenRouter отклонил запрос: проверьте API-ключ";
        }
        if (status == HttpStatus.PAYMENT_REQUIRED) {
            return "OpenRouter отклонил запрос: проверьте баланс аккаунта";
        }
        if (status == HttpStatus.TOO_MANY_REQUESTS) {
            return "OpenRouter отклонил запрос: превышен лимит запросов";
        }
        if (status != null && status.is4xxClientError()) {
            return "OpenRouter отклонил запрос: проверьте модель и параметры";
        }
        return "Не удалось получить ответ от OpenRouter";
    }

    private String extractReply(OpenRouterChatResponse response) {
        if (response == null || response.choices() == null || response.choices().isEmpty()) {
            throw new BadRequestException("OpenRouter не вернул ответ");
        }
        OpenRouterChatResponse.Message message = response.choices().get(0).message();
        if (message == null || message.content() == null || message.content().isBlank()) {
            throw new BadRequestException("OpenRouter вернул пустой ответ");
        }
        return message.content().trim();
    }
}
