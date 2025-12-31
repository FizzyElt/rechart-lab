import {
  Pie,
  PieChart,
  Label,
  Tooltip,
  Sector,
  Legend,
  type PieSectorShapeProps,
  type TooltipContentProps,
} from "recharts";
import { Box, Stack, Circle, Text } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";

const data = [
  { name: "Group A", value: 400, fill: "#0088FE" },
  { name: "Group B", value: 300, fill: "#00C49F" },
  { name: "Group C", value: 300, fill: "#FFBB28" },
  { name: "Group D", value: 200, fill: "#FF8042" },
];

const renderActiveShape = (props: PieSectorShapeProps): React.ReactElement => {
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
      {isActive && (
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

const ToolTipContent = (
  props: TooltipContentProps<string | number, string>,
) => {
  const { payload } = props;
  const dataContent = payload && payload.length > 0 ? payload[0] : null;

  return (
    <Box borderRadius={2} overflow="hidden" bg="white">
      <Box px={3} py={1} bg="gray.300">
        <Text fontSize="xs">{dataContent?.name}</Text>
      </Box>
      <Box px={3} py={1}>
        <Stack direction="row" align="center" mb={1}>
          <Circle size={2} bgColor={dataContent?.payload.fill} />
          <Text fontSize="xs">{dataContent?.value}</Text>
        </Stack>
      </Box>
    </Box>
  );
};

const MyPieChart = () => {
  const [showIndex, setShowIndex] = useState<number | undefined>(undefined);
  const autoShow = useRef<"idle" | "showing" | "ended">("idle");
  const [autoShowState, setAutoShowState] = useState<
    "idle" | "showing" | "ended"
  >("idle");

  useEffect(() => {
    if (showIndex !== undefined && autoShowState === "showing") {
      const timeoutId = setTimeout(() => {
        if (showIndex === data.length - 1) {
          autoShow.current = "ended";
          setAutoShowState("ended");
          setShowIndex(undefined);
        } else {
          setShowIndex(showIndex + 1);
        }
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [showIndex, autoShowState]);

  const triggerAnimation = () => {
    setTimeout(() => {
      if (autoShow.current === "idle") {
        setAutoShowState("showing");
        autoShow.current = "showing";
        setShowIndex(0);
      }
    }, 2000);
  };

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
        shape={renderActiveShape}
        onAnimationEnd={() => {
          console.log("onAnimationEnd");
          triggerAnimation();
        }}
      />
      <Label value="Pie Chart" position="center" />
      <Tooltip
        content={ToolTipContent}
        defaultIndex={showIndex}
        animationDuration={200}
        trigger={autoShowState === "ended" ? "hover" : "click"}
      />

      <Legend
        verticalAlign="bottom"
        height={36}
        onMouseEnter={(_data, idx) => {
          if (autoShow.current === "ended") {
            setShowIndex(idx);
          }
        }}
        onMouseLeave={() => {
          if (autoShow.current === "ended") {
            setShowIndex(undefined);
          }
        }}
      />
    </PieChart>
  );
};

export default MyPieChart;
