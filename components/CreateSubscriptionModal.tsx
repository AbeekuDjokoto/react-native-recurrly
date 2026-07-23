import { icons } from "@/constants/icons";
import { colors } from "@/constants/theme";
import { getBrandLogoSource } from "@/lib/logos";
import clsx from "clsx";
import dayjs from "dayjs";
import React, { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

const FREQUENCIES = ["Monthly", "Yearly"] as const;
type Frequency = (typeof FREQUENCIES)[number];

const CATEGORIES = [
  "Entertainment",
  "AI Tools",
  "Developer Tools",
  "Design",
  "Productivity",
  "Cloud",
  "Music",
  "Other",
] as const;
type Category = (typeof CATEGORIES)[number];

const CATEGORY_COLORS: Record<Category, string> = {
  Entertainment: "#f5c542",
  "AI Tools": "#b8d4e3",
  "Developer Tools": "#e8def8",
  Design: "#b8e8d0",
  Productivity: "#f5d4a8",
  Cloud: "#c5e0f5",
  Music: "#e8c5f5",
  Other: "#d4d4d4",
};

type CreateSubscriptionModalProps = {
  visible: boolean;
  onClose: () => void;
  onCreate: (subscription: Subscription) => void;
};

const CreateSubscriptionModal = ({
  visible,
  onClose,
  onCreate,
}: CreateSubscriptionModalProps) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [frequency, setFrequency] = useState<Frequency>("Monthly");
  const [category, setCategory] = useState<Category>("Entertainment");

  const parsedPrice = Number.parseFloat(price);
  const isValid =
    name.trim().length > 0 && Number.isFinite(parsedPrice) && parsedPrice > 0;

  const resetForm = () => {
    setName("");
    setPrice("");
    setFrequency("Monthly");
    setCategory("Entertainment");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    if (!isValid) return;

    const startDate = dayjs();
    const renewalDate =
      frequency === "Monthly"
        ? startDate.add(1, "month")
        : startDate.add(1, "year");

    const trimmedName = name.trim();
    const subscription: Subscription = {
      id: `${trimmedName.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
      name: trimmedName,
      price: parsedPrice,
      category,
      status: "active",
      startDate: startDate.toISOString(),
      renewalDate: renewalDate.toISOString(),
      icon: getBrandLogoSource(trimmedName),
      billing: frequency,
      color: CATEGORY_COLORS[category],
      currency: "USD",
    };

    onCreate(subscription);
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View className="modal-overlay">
          <View className="modal-container">
            <View className="modal-header">
              <Text className="modal-title">New Subscription</Text>
              <Pressable className="modal-close" onPress={handleClose}>
                <Text className="modal-close-text">×</Text>
              </Pressable>
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerClassName="modal-body"
            >
              <View className="auth-field">
                <Text className="auth-label">Name</Text>
                <View className="flex-row items-center gap-3">
                  <Image
                    source={
                      name.trim()
                        ? getBrandLogoSource(name)
                        : icons.wallet
                    }
                    className="size-14 rounded-2xl bg-muted"
                    resizeMode="contain"
                  />
                  <TextInput
                    className="auth-input flex-1"
                    value={name}
                    onChangeText={setName}
                    placeholder="e.g. Netflix, Spotify, Notion"
                    placeholderTextColor={colors.mutedForeground}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              <View className="auth-field">
                <Text className="auth-label">Price</Text>
                <TextInput
                  className="auth-input"
                  value={price}
                  onChangeText={setPrice}
                  placeholder="0.00"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="decimal-pad"
                />
              </View>

              <View className="auth-field">
                <Text className="auth-label">Frequency</Text>
                <View className="picker-row">
                  {FREQUENCIES.map((option) => {
                    const isActive = frequency === option;
                    return (
                      <Pressable
                        key={option}
                        className={clsx(
                          "picker-option",
                          isActive && "picker-option-active",
                        )}
                        onPress={() => setFrequency(option)}
                      >
                        <Text
                          className={clsx(
                            "picker-option-text",
                            isActive && "picker-option-text-active",
                          )}
                        >
                          {option}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View className="auth-field">
                <Text className="auth-label">Category</Text>
                <View className="category-scroll">
                  {CATEGORIES.map((option) => {
                    const isActive = category === option;
                    return (
                      <Pressable
                        key={option}
                        className={clsx(
                          "category-chip",
                          isActive && "category-chip-active",
                        )}
                        onPress={() => setCategory(option)}
                      >
                        <Text
                          className={clsx(
                            "category-chip-text",
                            isActive && "category-chip-text-active",
                          )}
                        >
                          {option}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <Pressable
                className={clsx(
                  "auth-button",
                  !isValid && "auth-button-disabled",
                )}
                onPress={handleSubmit}
                disabled={!isValid}
              >
                <Text className="auth-button-text">Add Subscription</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default CreateSubscriptionModal;
