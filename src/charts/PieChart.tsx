import {
  Pie,
  PieChart,
  Label,
  Tooltip,
  Sector,
  Legend,
  type PieSectorShapeProps,
  type TooltipContentProps,
  type TooltipIndex,
} from "recharts";
import { Box, Stack, Circle, Text } from "@chakra-ui/react";
import { useEffect, useRef, useState, useCallback } from "react";
import { Match, Boolean as Bool } from "effect";
import type {
  ValueType,
  NameType,
} from "recharts/types/component/DefaultTooltipContent";

const data = [
  { name: "Group A", value: 400, fill: "#0088FE" },
  { name: "Group B", value: 300, fill: "#00C49F" },
  { name: "Group C", value: 300, fill: "#FFBB28" },
  { name: "Group D", value: 200, fill: "#FF8042" },
];

const renderActiveShape = (
  props: PieSectorShapeProps,
  activeShape: boolean | undefined,
): React.ReactElement => {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    isActive,
  } = props;

  return (
    <g>
      {/* 原本圓弧 */}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      {/* 突出圓弧 */}
      {(Bool.isBoolean(activeShape) ? activeShape : isActive) && (
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={(outerRadius ?? 0) + 2}
          outerRadius={(outerRadius ?? 0) + 12}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          opacity={0.3}
        />
      )}
    </g>
  );
};

const ToolTipContentCustom = (props: {
  data: { name: string; value: number; fill: string }[];
  defaultIndex?: number | TooltipIndex;
  activeIndex?: TooltipIndex;
}) => {
  const { data, defaultIndex, activeIndex } = props;
  const activeData = Match.value({
    defaultIndex,
    activeIndex,
  }).pipe(
    Match.when(
      { defaultIndex: Match.number },
      ({ defaultIndex }) => data[defaultIndex],
    ),
    Match.whenOr(
      { defaultIndex: Match.string },
      { defaultIndex: Match.null },
      () => undefined,
    ),
    Match.when(
      { activeIndex: Match.string },
      ({ activeIndex }) => data[Number.parseInt(activeIndex)],
    ),
    Match.orElse(() => undefined),
  );

  if (activeData) {
    return (
      <Box borderRadius={2} overflow="hidden" bg="white">
        <Box px={3} py={1} bg="gray.300">
          <Text fontSize="xs">{activeData?.name}</Text>
        </Box>
        <Box px={3} py={1}>
          <Stack direction="row" align="center" mb={1}>
            <Circle size={2} bgColor={activeData?.fill} />
            <Text fontSize="xs">{activeData?.value}</Text>
          </Stack>
        </Box>
      </Box>
    );
  }

  return null;
};

const MyPieChart = () => {
  const [showIndex, setShowIndex] = useState<number | undefined>(undefined);

  // tooltip 控制權
  const [active, setActive] = useState<boolean | undefined>(undefined);
  // 動畫狀態
  const autoShowRef = useRef<"idle" | "showing" | "ended">("idle");
  useEffect(() => {
    if (showIndex !== undefined && autoShowRef.current === "showing") {
      const timeoutId = setTimeout(() => {
        if (showIndex === data.length - 1) {
          autoShowRef.current = "ended";
          setActive(undefined);
          setShowIndex(undefined);
        } else {
          setShowIndex(showIndex + 1);
        }
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [showIndex]);

  const triggerAnimation = () => {
    if (autoShowRef.current === "idle") {
      autoShowRef.current = "showing";
      setTimeout(() => {
        setActive(true);
        setShowIndex(0);
      }, 2000);
    }
  };

  const renderShape = useCallback(
    (shapeProps: PieSectorShapeProps, shapeIndex: number) => {
      return renderActiveShape(
        shapeProps,
        Number.isInteger(showIndex) ? shapeIndex === showIndex : undefined,
      );
    },
    [showIndex],
  );

  const renderTooltip = useCallback(
    <TValue extends ValueType, TName extends NameType>({
      defaultIndex,
      activeIndex,
    }: TooltipContentProps<TValue, TName>) => {
      return (
        <ToolTipContentCustom
          data={data}
          defaultIndex={defaultIndex}
          activeIndex={activeIndex}
        />
      );
    },
    [data],
  );

  return (
    <PieChart responsive style={{ width: "220px", aspectRatio: 1 }}>
      <Pie
        data={data}
        // 順時針從頂部長出
        startAngle={90}
        endAngle={-270}
        dataKey="value"
        nameKey="name"
        outerRadius="200px"
        innerRadius="50%"
        paddingAngle={2}
        shape={renderShape}
        onAnimationEnd={() => {
          triggerAnimation();
        }}
      />
      <Label value="Pie Chart" position="center" />

      {/* controlled */}
      <Tooltip
        content={renderTooltip}
        defaultIndex={showIndex}
        active={active}
        isAnimationActive={false}
      />

      <Legend
        verticalAlign="bottom"
        align="center"
        height={50}
        onMouseEnter={(_data, idx) => {
          if (autoShowRef.current === "ended") {
            setActive(true);
            setShowIndex(idx);
          }
        }}
        onMouseLeave={() => {
          if (autoShowRef.current === "ended") {
            setActive(undefined);
            setShowIndex(undefined);
          }
        }}
      />
    </PieChart>
  );
};

export default MyPieChart;
