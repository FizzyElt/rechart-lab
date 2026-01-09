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
import { Box, Button, Text, Stack, Circle } from "@chakra-ui/react";
import { Number as Num } from "struct-fakerator/utils";

import { DateTime } from "effect";
import { useMemo, useState } from "react";

const scheme = sc.array(
  sc.object({
    revenue: Num.int({ min: 0, max: 10000 }),
    profit: Num.int({ min: 0, max: 20000 }),
  }),
  360,
);

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
  const month = date.getMonth() + 1;

  return month.toString();
};

const MyLineChart = () => {
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

    return data.filter((_, index) => index % 30 === 0).map(({ date }) => date);
  }, [data, mobileMode]);

  return (
    <>
      <Button size="sm" onClick={() => setMobileMode((prev) => !prev)}>
        mb/pc
      </Button>
      <Button size="sm" onClick={() => setReload((prev) => prev + 1)}>
        reload
      </Button>
      <LineChart
        style={{
          width: "100%",
          height: mobileMode ? "400px" : "300px",
        }}
        responsive
        data={data}
        margin={{
          top: mobileMode ? 100 : 0,
          right: 20,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <Line dataKey="revenue" dot={false} strokeWidth={2} stroke="#30c2f2" />
        <Line dataKey="profit" dot={false} strokeWidth={2} stroke="#023a4d" />
        <XAxis
          dataKey="date"
          type="number"
          domain={["dataMin", "dataMax"]}
          ticks={ticks}
          tickFormatter={(data) => tickFormatter(data, mobileMode)}
        />
        <YAxis />
        <Tooltip<number, string>
          position={mobileMode ? { x: 0, y: 0 } : undefined}
          content={CustomTooltip}
          labelFormatter={(label: number | undefined) =>
            label ? new Date(label).toDateString() : label
          }
        />
        <Legend />
      </LineChart>
    </>
  );
};

export default MyLineChart;
