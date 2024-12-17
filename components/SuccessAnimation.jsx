import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle, Polyline } from "react-native-svg";

export default function SuccessAnimation({ onAnimationEnd }) {
  const [circleProgress, setCircleProgress] = useState(1194);
  const [tickProgress, setTickProgress] = useState(350);

  useEffect(() => {
    let circleInterval = setInterval(() => {
      setCircleProgress((prev) => {
        const newValue = prev - 20;
        if (newValue <= 0) {
          clearInterval(circleInterval);
          startTickAnimation();
        }
        return newValue <= 0 ? 0 : newValue;
      });
    }, 10);

    const startTickAnimation = () => {
      let tickInterval = setInterval(() => {
        setTickProgress((prev) => {
          const newValue = prev - 10;
          if (newValue <= 0) {
            clearInterval(tickInterval);
            setTimeout(onAnimationEnd, 1000); // מעבר לדף
          }
          return newValue <= 0 ? 0 : newValue;
        });
      }, 10);
    };

    return () => {
      clearInterval(circleInterval);
    };
  }, []);

  return (
    <View style={styles.container}>
      <Svg width="200" height="200" viewBox="0 0 400 400">
        {/* מעגל */}
        <Circle
          cx="200"
          cy="200"
          r="190"
          stroke="#C6A052"
          strokeWidth="20"
          fill="none"
          strokeLinecap="round"
          transform="rotate(-90 200 200)"
          strokeDasharray="1194"
          strokeDashoffset={circleProgress}
        />
        {/* ה-V */}
        <Polyline
          points="88,214 173,284 304,138"
          stroke="#C6A052"
          strokeWidth="24"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="350"
          strokeDashoffset={tickProgress}
        />
      </Svg>
      <Text style={styles.successText}>המודעה פורסמה בהצלחה!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  successText: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
});
