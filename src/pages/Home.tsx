import { ServiceDeck } from '../components/ServiceDeck';
import { TicketHero } from '../components/TicketHero';

export function Home() {
  return (
    <main>
      <TicketHero />
      <ServiceDeck />
    </main>
  );
}

export default Home;
