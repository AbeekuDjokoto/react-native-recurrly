import { icons } from "@/constants/icons";
import {
  formatCurrency,
  formatStatusLabel,
  formatSubscriptionDateTime,
} from "@/lib/utils";
import clsx from "clsx";
import React, { useEffect, useState } from "react";
import { Image, Pressable, Text, View } from "react-native";

const SubscriptionCard = ({
  name,
  price,
  currency,
  icon,
  category,
  plan,
  startDate,
  renewalDate,
  billing,
  color,
  expanded,
  onPress,
  onCancelPress,
  isCancelling,
  status,
  paymentMethod,
}: SubscriptionCardProps) => {
  const [iconFailed, setIconFailed] = useState(false);

  useEffect(() => {
    setIconFailed(false);
  }, [icon]);

  return (
    <Pressable
      onPress={onPress}
      className={clsx("sub-card", expanded ? "sub-card-expanded" : "bg-card")}
      style={!expanded && color ? { backgroundColor: color } : undefined}
    >
      <View className="sub-head">
        <View className="sub-main">
          <Image
            source={iconFailed ? icons.wallet : icon}
            className="sub-icon"
            resizeMode="contain"
            onError={() => setIconFailed(true)}
          />
          <View className="sub-copy">
            <Text className="sub-title" numberOfLines={1}>
              {name}
            </Text>
            <Text ellipsizeMode="tail" numberOfLines={1} className="sub-meta">
              {plan?.trim() ||
                category?.trim() ||
                (renewalDate ? formatSubscriptionDateTime(renewalDate) : "N/A")}
            </Text>
          </View>
        </View>

        <View className="sub-price-box">
          <Text className="sub-price">{formatCurrency(price, currency)}</Text>
          <Text className="sub-billing">{billing}</Text>
        </View>
      </View>

      {expanded && (
        <View className="sub-body">
          <View className="sub-details">
            <View className="sub-row">
              <View className="sub-row-copy">
                <Text className="sub-label">Payment info:</Text>
                <Text
                  className="sub-value"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {paymentMethod?.trim() || "N/A"}
                </Text>
              </View>
            </View>
            <View className="sub-row">
              <View className="sub-row-copy">
                <Text className="sub-label">Plan details:</Text>
                <Text
                  className="sub-value"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {plan?.trim() || category?.trim() || "N/A"}
                </Text>
              </View>
            </View>
            <View className="sub-row">
              <View className="sub-row-copy">
                <Text className="sub-label">Started:</Text>
                <Text
                  className="sub-value"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {startDate ? formatSubscriptionDateTime(startDate) : "N/A"}
                </Text>
              </View>
            </View>
            <View className="sub-row">
              <View className="sub-row-copy">
                <Text className="sub-label">Renewal date:</Text>
                <Text
                  className="sub-value"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {renewalDate
                    ? formatSubscriptionDateTime(renewalDate)
                    : "N/A"}
                </Text>
              </View>
            </View>
            <View className="sub-row">
              <View className="sub-row-copy">
                <Text className="sub-label">Status:</Text>
                <Text
                  className="sub-value"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {status ? formatStatusLabel(status) : "N/A"}
                </Text>
              </View>
            </View>
          </View>

          {onCancelPress && (
            <Pressable
              className={clsx(
                "sub-cancel",
                isCancelling && "sub-cancel-disabled",
              )}
              disabled={isCancelling || status === "cancelled"}
              onPress={(event) => {
                event.stopPropagation?.();
                onCancelPress();
              }}
            >
              <Text className="sub-cancel-text">
                {status === "cancelled" ? "Cancelled" : "Cancel Subscription"}
              </Text>
            </Pressable>
          )}
        </View>
      )}
    </Pressable>
  );
};

export default SubscriptionCard;
