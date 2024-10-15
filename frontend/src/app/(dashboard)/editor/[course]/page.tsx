import Editor from '@/components/editor/Editor';

export default async function Page({ params }: { params: { course: string } }) {
  console.log(params.course);

  return <Editor />;
}

