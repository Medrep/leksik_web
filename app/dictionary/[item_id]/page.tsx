import { CardDetailsScreen } from "@/components/CardDetailsScreen";

type CardDetailsPageProps = {
  params: {
    item_id: string;
  };
};

export default function CardDetailsPage({ params }: CardDetailsPageProps) {
  return <CardDetailsScreen item_id={params.item_id} />;
}
