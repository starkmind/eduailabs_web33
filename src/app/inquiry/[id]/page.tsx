import InquiryDetail from '@/components/InquiryDetail'

export default function InquiryDetailPage({ params }: { params: { id: string } }) {
  return <InquiryDetail id={parseInt(params.id)} />
} 