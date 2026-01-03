import { useReactToPrint } from "react-to-print";
import { Button } from "@/app/components/ui/button";

export function PrintPdf({
  contentRef,
}: {
  contentRef: React.RefObject<HTMLDivElement>;
}) {
  const reactToPrintFn = useReactToPrint({
    contentRef,
    documentTitle: "Invoice",
    pageStyle: `
      @page {
        margin: 0.5in;
        size: letter;
      }
      @media print {
        html, body {
          zoom: 100% !important;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      }
    `,
  });

  return (
    <div>
      <Button variant="secondary" onClick={() => reactToPrintFn()}>
        Print
      </Button>
    </div>
  );
}
