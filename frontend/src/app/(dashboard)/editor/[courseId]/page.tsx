import Editor from '@/components/editor/Editor';

export default async function Page({ params }: { params: { courseId: string } }) {
  console.log(params.courseId);

  return <Editor />;
}
