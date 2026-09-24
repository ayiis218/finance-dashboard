import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BreakdownPieChartLazy } from "@/components/charts/breakdown-pie-chart-lazy";

export function BreakdownPieCard({
  title,
  description,
  data,
}: Readonly<{
  title: string;
  description: string;
  data: { name: string; value: number }[];
}>) {
  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <BreakdownPieChartLazy data={data} />
      </CardContent>
    </Card>
  );
}
