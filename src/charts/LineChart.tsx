import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  type TooltipContentProps,
} from "recharts";
import { StructConfig as sc, StructGenerator as sg } from "struct-fakerator";
import {
  Box,
  Button,
  Text,
  Stack,
  Circle,
  Group,
  NumberInput,
} from "@chakra-ui/react";
import { Number as Num } from "struct-fakerator/utils";
import { compactNumber } from "@/util";
import { DateTime } from "effect";
import { useCallback, useMemo, useState } from "react";
import { useFakeData } from "@/hooks/useFakeData";

const scheme = sc.object({
  revenue: Num.int({ min: 0, max: 10000 }),
  profit: Num.int({ min: 0, max: 20000 }),
});

const now = DateTime.unsafeNow();

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

const tickFormatter = (data: number, mobileMode: boolean) => {
  const date = new Date(data);

  if (mobileMode) {
    return date.toDateString();
  }
  const month = (date.getMonth() + 1).toString();

  return month.length === 1 ? "0" + month : month;
};

const MyLineChart = () => {
  const [mobileMode, setMobileMode] = useState(false);
  const [dataCount, setDataCount] = useState(360);

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

    return data.filter((_, index) => index % 30 === 0).map(({ date }) => date);
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
          size="sm"
          defaultValue={dataCount.toString()}
          onValueChange={(e) => {
            if (!Number.isNaN(e.valueAsNumber)) {
              setDataCount(e.valueAsNumber);
            }
          }}
        >
          <NumberInput.Input />
        </NumberInput.Root>
        <Button size="sm" type="submit">
          reload
        </Button>
      </Group>
      <LineChart
        style={{
          width: "100%",
          height: mobileMode ? "400px" : "300px",
        }}
        responsive
        data={data}
        margin={{
          top: mobileMode ? 100 : 10,
          right: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <Line dataKey="revenue" dot={false} strokeWidth={2} stroke="#30c2f2" />
        <Line dataKey="profit" dot={false} strokeWidth={2} stroke="#023a4d" />
        <XAxis
          dataKey="date"
          type="number"
          tickLine={false}
          axisLine={false}
          ticks={ticks}
          tickFormatter={(data) => tickFormatter(data, mobileMode)}
        />
        <YAxis
          tickFormatter={compactNumber}
          width={48}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip<number, string>
          position={mobileMode ? { x: 0, y: 0 } : undefined}
          content={CustomTooltip}
          labelFormatter={(label: number | undefined) =>
            label ? new Date(label).toDateString() : label
          }
        />
        <Legend align="left" />
      </LineChart>
    </>
  );
};

export default MyLineChart;
