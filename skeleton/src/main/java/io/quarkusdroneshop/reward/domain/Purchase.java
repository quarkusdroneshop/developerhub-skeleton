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
     * 1オーダー内の合計商品数が5以上の顧客に、注文合計金額の10%をリワードポイントとして付与する。
     */
    public void processRewards(OrderBatch batch) {
        Map<String, Integer> itemCountByCustomer = new HashMap<>();
        Map<String, BigDecimal> totalByCustomer = new HashMap<>();

        for (OrderBatch.LineItem item : batch.qdca10LineItems) {
            itemCountByCustomer.merge(item.name, 1, Integer::sum);
            totalByCustomer.merge(item.name, item.price, BigDecimal::add);
        }
        for (OrderBatch.LineItem item : batch.qdca10proLineItems) {
            itemCountByCustomer.merge(item.name, 1, Integer::sum);
            totalByCustomer.merge(item.name, item.price, BigDecimal::add);
        }

        String rewardsId = (batch.rewardsId != null && !batch.rewardsId.isEmpty())
            ? batch.rewardsId : null;

        itemCountByCustomer.forEach((name, count) -> {
            if (count >= REWARD_THRESHOLD) {
                BigDecimal orderTotal = totalByCustomer.getOrDefault(name, BigDecimal.ZERO);
                BigDecimal rewardPoints = orderTotal.multiply(REWARD_RATE).setScale(2, RoundingMode.HALF_UP);

                String customerName = (rewardsId != null) ? rewardsId : name;
                RewardEvent rewardEvent = new RewardEvent(customerName, batch.orderId, rewardPoints);
                rewardEmitter.send(rewardEvent);

                logger.info("Reward issued — customer: {}, items: {}, orderTotal: {}, rewardPoints: {} ({}%)",
                    customerName, count, orderTotal, rewardPoints, REWARD_RATE.multiply(BigDecimal.valueOf(100)).intValue());
            }
        });
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
