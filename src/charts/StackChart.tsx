import { useState, useCallback, useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarStack,
  Cell,
  type BarRectangleItem,
  type TooltipContentProps,
} from "recharts";
import { Box, Circle, Stack, Text } from "@chakra-ui/react";
import { compactNumber } from "@/util";

const data = [
  {
    name: "2025/04",
    stackA: 3000,
    stackB: 4000,
    stackC: 2500,
  },
  {
    name: "2025/05",
    stackA: 1000,
    stackB: 7000,
    stackC: 2500,
  },
  {
    name: "2025/06",
    stackA: 5000,
    stackB: 4000,
    stackC: 700,
  },
];

const CustomTooltip = (props: TooltipContentProps<number, string>) => {
  const { payload, label } = props;
  return (
    <Box borderRadius={2} overflow="hidden" bg="white">
      <Box px={3} py={1} bg="gray.300">
        <Text fontSize="xs">{label}</Text>
      </Box>
      <Box px={3} py={1}>
        {payload
          .map((item) => {
            return (
              <Stack key={item.fill} direction="row" align="center" mb={1}>
                <Circle size={2} bgColor={item?.fill} />
                <Text fontSize="xs">{item?.value}</Text>
              </Stack>
            );
          })
          .reverse()}
      </Box>
    </Box>
  );
};

const StackChart = () => {
  const timeoutIdRef = useRef<number | undefined>(undefined);
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);
  const [activeStack, setActiveStack] = useState<string | undefined>(undefined);
  const handleEnter = useCallback((_event: BarRectangleItem, index: number) => {
    setActiveIndex(index);
  }, []);

  const handleLeave = useCallback(() => {
    setActiveIndex(undefined);
  }, []);

  const getOpacity = (index: number, stack: string) => {
    if (!!activeStack && activeStack !== stack) return 0.3;
    if (Number.isInteger(activeIndex) && activeIndex !== index) return 0.3;

    return undefined;
  };
  return (
    <BarChart
      style={{
        width: "100%",
        maxWidth: "700px",
        height: "400px",
        maxHeight: "70vh",
      }}
      responsive
      data={data}
      margin={{
        top: 20,
        bottom: 5,
        left: 0,
        right: 0,
      }}
    >
      <CartesianGrid strokeDasharray="3 3" vertical={false} />
      <XAxis dataKey="name" tickLine={false} axisLine={false} />
      <YAxis tickFormatter={compactNumber} tickLine={false} axisLine={false} />
      <BarStack radius={[5, 5, 0, 0]}>
        <Bar
          dataKey="stackC"
          barSize={50}
          fill="#3dc4d9"
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
        >
          {data.map((_entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill="#3dc4d9"
              opacity={getOpacity(index, "stackC")}
            />
          ))}
        </Bar>
        <Bar
          dataKey="stackB"
          barSize={50}
          fill="#237a04"
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
        >
          {data.map((_entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill="#237a04"
              opacity={getOpacity(index, "stackB")}
            />
          ))}
        </Bar>
        <Bar
          dataKey="stackA"
          barSize={50}
          fill="#164a03"
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
        >
          {data.map((_entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill="#164a03"
              opacity={getOpacity(index, "stackA")}
            />
          ))}
        </Bar>
      </BarStack>
      <Tooltip<number, string>
        cursor={false}
        defaultIndex={activeIndex}
        content={CustomTooltip}
        active={Number.isInteger(activeIndex)}
        useTranslate3d
      />
      <Legend
        onMouseEnter={(data, index) => {
          clearTimeout(timeoutIdRef.current);
          timeoutIdRef.current = undefined;
          setActiveStack(data.value);
        }}
        onMouseLeave={() => {
          timeoutIdRef.current = setTimeout(() => {
            setActiveStack(undefined);
          }, 400);
        }}
      />
    </BarChart>
  );
};

export default StackChart;
