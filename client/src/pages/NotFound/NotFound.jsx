import Seo from '../../components/ui/Seo/Seo';
import Button from '../../components/ui/Button/Button';
import EmptyState from '../../components/ui/EmptyState/EmptyState';
export default function NotFound() {
  return (
    <div className="container section">
      <Seo title="Faqja nuk u gjet" noindex />
      <EmptyState title="404 – Faqja nuk u gjet" text="Kjo lule ka fluturuar diku tjetër. Le t’ju kthejmë në ballinë.">
        <Button to="/">Kthehu në ballinë</Button>
      </EmptyState>
    </div>
  );
}
