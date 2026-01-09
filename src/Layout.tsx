import { Stack, Container, Separator, Center } from "@chakra-ui/react";
import PieChart from "@/charts/PieChart";
import StackChart from "@/charts/StackChart";
import LineChart from "@/charts/LineChart";
const Layout = () => {
  return (
    <Container maxW="1280px" py={4}>
      <Stack gap={8}>
        <Center>
          <PieChart />
        </Center>
        <Separator />
        <StackChart />
        <Separator />
        <LineChart />
      </Stack>
    </Container>
  );
};

export default Layout;
