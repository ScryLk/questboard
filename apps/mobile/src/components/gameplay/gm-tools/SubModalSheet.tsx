import { memo, useCallback, useEffect, useRef, type ReactNode } from "react";
import { View, StyleSheet } from "react-native";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import type {
  BottomSheetBackdropProps,
  BottomSheetHandleProps,
} from "@gorhom/bottom-sheet";
import { ArrowLeft } from "lucide-react-native";
import { Stack, Text, XStack } from "tamagui";

// ─── Custom Handle ────────────────────────────────────────

const SheetHandle = memo(function SheetHandle(_: BottomSheetHandleProps) {
  return (
    <View style={styles.handleContainer}>
      <View style={styles.handleBar} />
    </View>
  );
});

// ─── Sub-Modal Sheet ──────────────────────────────────────

interface SubModalSheetProps {
  isOpen: boolean;
  snapPoints: string[];
  initialIndex?: number;
  title: string;
  onBack: () => void;
  onDismiss?: () => void;
  headerRight?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  /** Set true when children use BottomSheetFlatList directly */
  useFlatList?: boolean;
}

function SubModalSheetInner({
  isOpen,
  snapPoints,
  initialIndex = 0,
  title,
  onBack,
  onDismiss,
  headerRight,
  footer,
  children,
  useFlatList = false,
}: SubModalSheetProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);

  useEffect(() => {
    if (isOpen) {
      bottomSheetRef.current?.snapToIndex(initialIndex);
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isOpen, initialIndex]);

  const handleSheetChange = useCallback(
    (index: number) => {
      if (index === -1) {
        onDismiss?.();
      }
    },
    [onDismiss],
  );

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior="close"
        opacity={0.5}
      />
    ),
    [],
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      index={-1}
      bottomInset={0}
      enablePanDownToClose={true}
      enableContentPanningGesture={false}
      enableHandlePanningGesture={true}
      enableOverDrag={true}
      enableDynamicSizing={false}
      animateOnMount={true}
      onChange={handleSheetChange}
      backdropComponent={renderBackdrop}
      handleComponent={SheetHandle}
      backgroundStyle={styles.sheetBg}
    >
      <BottomSheetView style={styles.outerContainer}>
        {/* Fixed Header */}
        <View style={styles.headerSection}>
          <XStack
            paddingHorizontal={16}
            alignItems="center"
            gap={12}
          >
            <Stack
              width={32}
              height={32}
              borderRadius={8}
              backgroundColor="#1C1C24"
              alignItems="center"
              justifyContent="center"
              pressStyle={{ opacity: 0.7 }}
              onPress={onBack}
            >
              <ArrowLeft size={18} color="#9090A0" />
            </Stack>
            <Text fontSize={14} fontWeight="700" color="#E8E8ED" flex={1}>
              {title}
            </Text>
            {headerRight}
          </XStack>
        </View>

        {/* Content */}
        {useFlatList ? (
          children
        ) : (
          <BottomSheetScrollView
            style={styles.scrollFlex}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
            contentContainerStyle={styles.scrollContent}
          >
            {children}
          </BottomSheetScrollView>
        )}

        {/* Footer */}
        {footer && <View style={styles.footer}>{footer}</View>}
      </BottomSheetView>
    </BottomSheet>
  );
}

export const SubModalSheet = memo(SubModalSheetInner);

const styles = StyleSheet.create({
  sheetBg: {
    backgroundColor: "#16161C",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#2A2A35",
  },
  handleContainer: {
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#16161C",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#5A5A6E",
  },
  outerContainer: {
    flex: 1,
  },
  headerSection: {
    paddingTop: 4,
    paddingBottom: 12,
  },
  scrollFlex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#1E1E2A",
    backgroundColor: "#16161C",
  },
});
