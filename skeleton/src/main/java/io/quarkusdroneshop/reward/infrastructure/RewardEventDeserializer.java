package io.quarkusdroneshop.reward.infrastructure;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.quarkusdroneshop.domain.valueobjects.RewardEvent;
import org.apache.kafka.common.serialization.Deserializer;

import java.io.IOException;

public class RewardEventDeserializer implements Deserializer<RewardEvent> {

    private final ObjectMapper mapper = new ObjectMapper();

    @Override
    public RewardEvent deserialize(String topic, byte[] data) {
        try {
            return mapper.readValue(data, RewardEvent.class);
        } catch (IOException e) {
            throw new RuntimeException("Failed to deserialize RewardEvent", e);
        }
    }
}
