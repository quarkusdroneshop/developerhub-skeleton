package io.quarkusdroneshop.reward.infrastructure;

import io.quarkus.runtime.annotations.RegisterForReflection;
import io.quarkusdroneshop.domain.valueobjects.*;
import io.quarkusdroneshop.reward.domain.OrderBatch;
import io.quarkusdroneshop.reward.domain.Purchase;

import org.eclipse.microprofile.reactive.messaging.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionStage;

@ApplicationScoped
@RegisterForReflection
public class KafkaService {

    Logger logger = LoggerFactory.getLogger(KafkaService.class);

    @Inject Purchase purchase;

    @Incoming("orders-in")
    @Acknowledgment(Acknowledgment.Strategy.PRE_PROCESSING)
    public CompletionStage<Void> onOrderIn(OrderBatch batch) {
        return CompletableFuture.runAsync(() -> {
            logger.info("Received OrderBatch: orderId={}, qdca10Items={}, qdca10proItems={}",
                batch.orderId,
                batch.qdca10LineItems != null ? batch.qdca10LineItems.size() : 0,
                batch.qdca10proLineItems != null ? batch.qdca10proLineItems.size() : 0);

            purchase.processRewards(batch);
        });
    }

    /**
     * rewards トピックからイベントを受信してリワード情報を表示する。
     */
    @Incoming("rewards-display")
    @Acknowledgment(Acknowledgment.Strategy.PRE_PROCESSING)
    public CompletionStage<Void> onReward(RewardEvent rewardEvent) {
        return CompletableFuture.runAsync(() -> {
            logger.info("*** REWARD NOTIFICATION *** customer: {}, orderId: {}, rewardPoints: {}",
                rewardEvent.getCustomerName(),
                rewardEvent.getOrderId(),
                rewardEvent.getRewardAmount());
        });
    }
}
