import { DateTime } from "effect";
import { useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  type TooltipContentProps,
} from "recharts";
import { Box, Button, Circle, Stack, Text } from "@chakra-ui/react";
import { StructConfig as sc, StructGenerator as sg } from "struct-fakerator";
import { Number as Num } from "struct-fakerator/utils";

const scheme = sc.array(
  sc.object({
    item1: Num.int({ min: 0, max: 1000 }),
    item2: Num.int({ min: 0, max: 1000 }),
  }),
  50,
);

const now = DateTime.unsafeNow();

const tickFormatter = (data: number, mobileMode: boolean) => {
  const date = new Date(data);

  if (mobileMode) {
    return date.toDateString();
  }
  const month = date.getMonth() + 1;

  return month.toString();
};

const CustomTooltip = (props: TooltipContentProps<number, string>) => {
  const { payload, label, labelFormatter } = props;
  return (
    <Box borderRadius={2} overflow="hidden" bg="white">
      <Box px={3} py={1} bg="gray.300">
        <Text fontSize="xs">
          {labelFormatter ? labelFormatter(label, payload) : label}
        </Text>
      </Box>
      <Box px={3} py={1}>
        {payload
          .map((item) => {
            return (
              <Stack key={item.stroke} direction="row" align="center" mb={1}>
                <Circle size={2} bgColor={item.stroke} />
                <Text fontSize="xs">{item?.value}</Text>
              </Stack>
            );
          })
          .reverse()}
      </Box>
    </Box>
  );
};

const MyAreaChart = () => {
  const [reload, setReload] = useState(0);
  const [mobileMode, setMobileMode] = useState(false);

  const data = useMemo(() => {
    return sg
      .genFn(scheme)()
      .map((content, index) => ({
        ...content,
        date: DateTime.add(now, { days: index })
          .pipe(DateTime.toDate)
          .getTime(),
      }));
  }, [reload]);

  const ticks = useMemo(() => {
    if (mobileMode) {
      const first = data[0].date;
      const last = data[data.length - 1].date;
      return [first, last];
    }

    const len = Math.floor(data.length / 12);

    return data.filter((_, index) => index % len === 0).map(({ date }) => date);
  }, [data, mobileMode]);

  const gradientOffset = useMemo(() => {
    const item1List = data.map(({ item1 }) => item1);
    const item1Max = Math.max(...item1List);
    const item1Min = Math.min(...item1List);

    const item1Offset = item1Max / (item1Max - item1Min);

    const item2List = data.map(({ item2 }) => item2);
    const item2Max = Math.max(...item2List);
    const item2Min = Math.min(...item2List);

    const item2Offset = item2Max / (item2Max - item2Min);

    return {
      item1Offset,
      item2Offset,
    };
  }, []);

  return (
    <>
      <Button size="sm" onClick={() => setMobileMode((prev) => !prev)}>
        mb/pc
      </Button>
      <Button size="sm" onClick={() => setReload((prev) => prev + 1)}>
        reload
      </Button>
      <AreaChart
        style={{
          width: "100%",
          height: mobileMode ? "400px" : "300px",
          aspectRatio: 1.618,
        }}
        responsive
        data={data}
        margin={{
          top: mobileMode ? 100 : 0,
          right: 20,
          left: 20,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="date"
          type="number"
          domain={["dataMin", "dataMax"]}
          ticks={ticks}
          tickFormatter={(data: number) => tickFormatter(data, mobileMode)}
        />
        <YAxis width="auto" />
        <Tooltip
          content={CustomTooltip}
          position={mobileMode ? { x: 0, y: 0 } : undefined}
        />
        <defs>
          <linearGradient id="item_1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#00add4" stopOpacity={1} />
            <stop
              offset={gradientOffset.item1Offset}
              stopColor="#00add4"
              stopOpacity={0}
            />
          </linearGradient>
          <linearGradient id="item_2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#00601a" stopOpacity={1} />
            <stop
              offset={gradientOffset.item2Offset}
              stopColor="#00601a"
              stopOpacity={0}
            />
          </linearGradient>
        </defs>

        <Area
          strokeWidth={2}
          dataKey="item1"
          stroke="#00add4"
          fill="url(#item_1)"
        />
        <Area
          strokeWidth={2}
          dataKey="item2"
          stroke="#00601a"
          fill="url(#item_2)"
        />
      </AreaChart>
    </>
  );
};

export default MyAreaChart;
