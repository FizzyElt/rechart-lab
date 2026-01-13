import { DateTime } from "effect";
import { useCallback, useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  type TooltipContentProps,
  Legend,
} from "recharts";
import {
  Box,
  Button,
  Circle,
  Stack,
  Text,
  NumberInput,
  Group,
} from "@chakra-ui/react";
import { StructConfig as sc, StructGenerator as sg } from "struct-fakerator";
import { Number as Num, Common } from "struct-fakerator/utils";
import { compactNumber } from "@/util";
import { useFakeData } from "@/hooks/useFakeData";

const constantScheme = sc.object({
  item1: Common.constant(1000),
  item2: Common.constant(100),
});
const randomScheme = sc.object({
  item1: Num.int({ min: 0, max: 1_000_000 }),
  item2: Num.int({ min: 0, max: 1_000_000 }),
});

const scheme = randomScheme;

const now = DateTime.unsafeNow();

const tickFormatter = (data: number, mobileMode: boolean) => {
  const date = new Date(data);

  if (mobileMode) {
    return date.toDateString();
  }
  const month = (date.getMonth() + 1).toString();

  return month.length === 1 ? "0" + month : month;
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
        {payload.map((item) => {
          return (
            <Stack key={item.stroke} direction="row" align="center" mb={1}>
              <Circle size={2} bgColor={item.stroke} />
              <Text fontSize="xs">{item?.value}</Text>
            </Stack>
          );
        })}
      </Box>
    </Box>
  );
};

const MyAreaChart = () => {
  const [mobileMode, setMobileMode] = useState(false);
  const [dataCount, setDataCount] = useState(60);
  const [visible, setVisible] = useState({
    item1: true,
    item2: true,
  });

  const genDataFn = useCallback(() => {
    return sg
      .genFn(sc.array(scheme, dataCount))()
      .map((content, index) => ({
        ...content,
        date: DateTime.add(now, { days: index })
          .pipe(DateTime.toDate)
          .getTime(),
      }));
  }, [dataCount]);

  const { data, handleReload } = useFakeData(genDataFn);

  const ticks = useMemo(() => {
    if (mobileMode) {
      const first = data[0].date;
      const last = data[data.length - 1].date;
      return [first, last];
    }

    const len = Math.floor(data.length / 12);

    return data.filter((_, index) => index % len === 0).map(({ date }) => date);
  }, [data, mobileMode]);

  return (
    <>
      <Button size="sm" onClick={() => setMobileMode((prev) => !prev)}>
        mb/pc
      </Button>
      <Group
        as="form"
        onSubmit={(e) => {
          e.preventDefault();
          handleReload();
        }}
      >
        <NumberInput.Root
          defaultValue={dataCount.toString()}
          size="sm"
          onValueChange={(e) => {
            if (!Number.isNaN(e.valueAsNumber)) {
              setDataCount(e.valueAsNumber);
            }
          }}
        >
          <NumberInput.Input />
        </NumberInput.Root>
        <Button type="submit" size="sm">
          reload
        </Button>
      </Group>
      <AreaChart
        style={{
          width: "100%",
          height: mobileMode ? "400px" : "300px",
          aspectRatio: 1.618,
        }}
        responsive
        data={data}
        margin={{
          top: mobileMode ? 100 : 10,
          right: 20,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="date"
          type="number"
          tickLine={false}
          axisLine={false}
          ticks={ticks}
          padding={{ left: 5 }}
          tickFormatter={(data: number) => tickFormatter(data, mobileMode)}
        />
        <YAxis
          tickFormatter={compactNumber}
          width={48}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          content={CustomTooltip}
          position={mobileMode ? { x: 0, y: 0 } : undefined}
        />
        <defs>
          <linearGradient id="item_1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#00add4" stopOpacity={1} />
            <stop offset={1} stopColor="#00add4" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="item_2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#00601a" stopOpacity={1} />
            <stop offset={1} stopColor="#00601a" stopOpacity={0} />
          </linearGradient>
        </defs>

        <Area
          hide={!visible.item1}
          strokeWidth={2}
          dataKey="item1"
          stroke="#00add4"
          fill="url(#item_1)"
        />
        <Area
          hide={!visible.item2}
          strokeWidth={2}
          dataKey="item2"
          stroke="#00601a"
          fill="url(#item_2)"
        />

        <Legend
          align="left"
          onClick={(data) => {
            setVisible((prev) => {
              const newValue = data.value
                ? !prev[data.value as "item1" | "item2"]
                : false;

              return {
                ...prev,
                [data.value || ""]: newValue,
              };
            });
          }}
        />
      </AreaChart>
    </>
  );
};

export default MyAreaChart;
