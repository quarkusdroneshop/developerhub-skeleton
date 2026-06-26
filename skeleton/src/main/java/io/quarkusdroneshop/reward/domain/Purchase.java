package io.quarkusdroneshop.reward.domain;

import io.quarkusdroneshop.domain.valueobjects.*;

import org.eclipse.microprofile.reactive.messaging.Channel;
import org.eclipse.microprofile.reactive.messaging.Emitter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.annotation.PostConstruct;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.InetAddress;
import java.time.Instant;
import java.util.*;

@ApplicationScoped
public class Purchase implements OrderProcessingResult {

    static final Logger logger = LoggerFactory.getLogger(Purchase.class);

    private static final int REWARD_THRESHOLD = 5;
    private static final BigDecimal REWARD_RATE = BigDecimal.valueOf(0.10);

    private OrderUp orderUp;
    private boolean isEightySixed;
    private String madeBy;

    @Inject
    @Channel("rewards")
    Emitter<RewardEvent> rewardEmitter;

    @PostConstruct
    void setHostName() {
        try {
            madeBy = InetAddress.getLocalHost().getHostName();
        } catch (IOException e) {
            logger.debug("unable to get hostname");
            madeBy = "unknown";
        }
    }

    public Purchase make(final OrderIn orderIn) {
        this.orderUp = new OrderUp(
            orderIn.getOrderId(),
            orderIn.getLineItemId(),
            orderIn.getItem(),
            orderIn.getName(),
            Instant.now(),
            madeBy
        );
        this.isEightySixed = false;
        return this;
    }

    /**
     * rewardsId が設定されている注文で合計商品数が閾値以上の場合、注文合計金額の10%をリワードポイントとして付与する。
     */
    public void processRewards(OrderBatch batch) {
        if (batch.rewardsId == null || batch.rewardsId.isEmpty()) {
            logger.info("No rewardsId in order {}, skipping reward", batch.orderId);
            return;
        }

        int totalItems = (batch.qdca10LineItems != null ? batch.qdca10LineItems.size() : 0)
                       + (batch.qdca10proLineItems != null ? batch.qdca10proLineItems.size() : 0);

        if (totalItems < REWARD_THRESHOLD) {
            logger.info("Order {} has {} items, threshold is {}, no reward issued",
                batch.orderId, totalItems, REWARD_THRESHOLD);
            return;
        }

        BigDecimal orderTotal = BigDecimal.ZERO;
        if (batch.qdca10LineItems != null) {
            for (OrderBatch.LineItem item : batch.qdca10LineItems) {
                orderTotal = orderTotal.add(item.price);
            }
        }
        if (batch.qdca10proLineItems != null) {
            for (OrderBatch.LineItem item : batch.qdca10proLineItems) {
                orderTotal = orderTotal.add(item.price);
            }
        }

        BigDecimal rewardPoints = orderTotal.multiply(REWARD_RATE).setScale(2, RoundingMode.HALF_UP);
        RewardEvent rewardEvent = new RewardEvent(batch.rewardsId, batch.orderId, rewardPoints);
        rewardEmitter.send(rewardEvent);

        logger.info("Reward issued — customer: {}, items: {}, orderTotal: {}, rewardPoints: {} ({}%)",
            batch.rewardsId, totalItems, orderTotal, rewardPoints,
            REWARD_RATE.multiply(BigDecimal.valueOf(100)).intValue());
    }

    @Override
    public boolean isEightySixed() {
        return isEightySixed;
    }

    @Override
    public OrderUp getOrderUp() {
        return orderUp;
    }

    @Override
    public RewardEvent getRewardEvent() {
        return null;
    }
}
