import { Text, TextInput, TextInputProps, StyleSheet, View } from "react-native";

import { useResolvedTheme } from "../lib/theme";

export function MonoInput({
  label,
  multiline,
  ...props
}: TextInputProps & {
  label: string;
}) {
  const theme = useResolvedTheme();

  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: theme.colors.textMuted }]}>{label}</Text>
      <TextInput
        {...props}
        multiline={multiline}
        placeholderTextColor={theme.colors.textMuted}
        style={[
          styles.input,
          multiline && styles.textarea,
          {
            color: theme.colors.textPrimary,
            borderColor: theme.colors.borderSoft,
            backgroundColor: theme.colors.surfaceSecondary,
          },
          props.style,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 8,
  },
  label: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 10,
    letterSpacing: 1.4,
  },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: "SpaceGrotesk_400Regular",
    fontSize: 14,
  },
  textarea: {
    minHeight: 120,
    textAlignVertical: "top",
  },
});
