import { BackstagePageClient } from "./_components/backstage-page-client";

interface BackstagePageProps {
  params: {
    streamId: string;
  };
}

const BackstagePage = ({ params }: BackstagePageProps) => {
  return <BackstagePageClient streamId={params.streamId} />;
};

export default BackstagePage;
