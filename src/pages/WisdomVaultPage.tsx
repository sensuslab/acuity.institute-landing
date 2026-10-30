import { Link } from 'react-router-dom';
import { ToolClosing, ToolHero, ToolPage } from '../components/tools/ToolPrimitives';

export default function WisdomVaultPage() {
  return <ToolPage id="wisdomvault" description="WisdomVault is under development: connect the Acuity knowledge library to your own services and applications through MCP.">
    <ToolHero kind="wisdomvault" index="05" title={<>Wisdom, wherever<br /><em>you work.</em></>} description="A connection to the Acuity knowledge library for your own services and applications. WisdomVault is under development and will form part of Acuity.One." />
    <section id="capabilities" className="tool-wrap tool-section wisdom-draft"><p className="tool-eyebrow">On the horizon / Under development</p><h2>Bring the source<br /><em>into your own context.</em></h2><p>WisdomVault is being developed as an MCP connection for discovering passages, finding exact phrases, comparing traditions and reading knowledge with its source references. It extends the Library into compatible tools and applications you choose.</p><p>Its collection is designed to hold scripture, commentary, mystical literature, essays and selected articles, with author, edition and passage context preserved.</p><p>WisdomVault is separate from <Link to="/tools/codex">myVault inside Acuity.Codex</Link>, which keeps your private study notes and outputs.</p></section><div id="journey"><ToolClosing current="wisdomvault" /></div>
  </ToolPage>;
}
