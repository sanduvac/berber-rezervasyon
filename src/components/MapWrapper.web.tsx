import React from "react";
import { View, Text } from "react-native";

export const Marker = (props: any) => <View {...props} />;
export const Polyline = (props: any) => <View {...props} />;
export const Callout = (props: any) => <View {...props} />;

const MapView = (props: any) => (
  <View style={[{ alignItems: "center", justifyContent: "center", backgroundColor: "#f3f4f6" }, props.style]}>
    <Text style={{ color: "#6b7280", fontWeight: "600" }}>Harita Görünümü (Web'de Desteklenmiyor)</Text>
  </View>
);

export default MapView;

export type Region = any;
