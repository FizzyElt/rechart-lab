import { Stack, Container } from "@chakra-ui/react";
import PieChart from "@/charts/PieChart";

const Layout = () => {
  return (
    <Container maxW="xl" py={4}>
      <Stack alignItems="center">
        <PieChart />
      </Stack>
    </Container>
  );
};

export default Layout;
