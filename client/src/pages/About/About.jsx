import Seo from '../../components/ui/Seo/Seo';
import PageHeader from '../../components/ui/PageHeader/PageHeader';
import Button from '../../components/ui/Button/Button';
import FloralArt from '../../components/ui/FloralArt/FloralArt';
import styles from './About.module.css';

export default function About() {
  return (
    <>
      <Seo title="Rreth Nesh" description="Lulea është një atelier lulesh që krijon buqeta të punuara me dorë me lulet më të freskëta, me dashuri për çdo detaj." />
      <PageHeader crumbs={[{ name: 'Kryefaqja', path: '/' }, { name: 'Rreth nesh', path: '/rreth-nesh' }]} eyebrow="Historia jonë" title="Rreth Lulea" />
      <section className={`container section ${styles.grid}`}>
        <div className={styles.art}><FloralArt color="#7d6560" /></div>
        <div>
          <h2>Lulet më të bukura në qytet</h2>
          <p>Lulea lindi nga një dashuri e thjeshtë: momenti kur dikush hap derën dhe sheh një buqetë të krijuar vetëm për të. Çdo mëngjes zgjedhim lulet më të freskëta dhe i kthejmë në kompozime që flasin në vend tuaj.</p>
          <p>Ekipi ynë i floristëve punon me kujdes për çdo detaj – nga ngjyrat dhe teksturat, deri te fjongoja e fundit. Besojmë se lulet duhet të jenë të arritshme, ndaj ofrojmë dërgesë të shpejtë dhe pagesë cash në dorëzim.</p>
          <ul className={styles.values}>
            <li><strong>Freski</strong>Lule të zgjedhura çdo ditë</li>
            <li><strong>Mjeshtëri</strong>Çdo buqetë punohet me dorë</li>
            <li><strong>Kujdes</strong>Dërgesë e sigurt, në kohë</li>
          </ul>
          <Button to="/dyqani">Shiko koleksionin</Button>
        </div>
      </section>
    </>
  );
}
