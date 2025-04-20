import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");



function Counter({ value, title }) {
  return (
    <View style={styles.counterContainer}>
      {/* Display the number directly */}
      <Text style={styles.counterValue}>
        {value.toLocaleString("he-IL")}
      </Text>
      <Text style={styles.counterTitle}>{title}</Text>
    </View>
  );
}

export function AnimatedCounters() {
  return (
    <View style={styles.gridWrapper}>
      <View style={styles.grid}>
        <Counter value={1206} title="עבודות הושלמו" />
        <Counter value={256} title="אנשי מקצוע" />
        <Counter value={98} title="% שביעות רצון" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  gridWrapper: {
    width: "100%",
    backgroundColor: "#f5efe6",
    paddingHorizontal: 10,
  },
  grid: {
    flexDirection: width < 600 ? "column" : "row-reverse",
    justifyContent: "space-evenly",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },
  counterContainer: {
    alignItems: "center",
    marginVertical: 20,
    width: width < 600 ? "100%" : 250,
  },
  counterValue: {
    fontSize: width < 600 ? 30 : 40,
    fontWeight: "bold",
    color: "#D4AF37",
    marginBottom: 10,
    textAlign: "center",
  },
  counterTitle: {
    fontSize: width < 600 ? 16 : 18,
    color: "#666",
    textAlign: "center",
    writingDirection: "rtl",
    fontWeight: "600",
  },
});

export default AnimatedCounters;
