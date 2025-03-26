
export default function QRTestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">QR Code Style and Color Test</h1>
      {children}
    </div>
  );
}
