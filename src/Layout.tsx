import { Stack, Container, Separator, Center } from "@chakra-ui/react";
import PieChart from "@/charts/PieChart";
import StackChart from "@/charts/StackChart";

const Layout = () => {
  return (
    <Container maxW="xl" py={4}>
      <Stack>
        <Center>
          <PieChart />
        </Center>
        <Separator />
        <StackChart />
      </Stack>
    </Container>
  );
};

export default Layout;
