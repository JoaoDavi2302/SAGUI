import Link from "next/link";

export default function Footer() {
  return (
  <footer className="footer sm:footer-horizontal bg-base-200 text-base-content p-10">
  <aside>
    <a href="/" color="#000">
      SAGUI
      <br />
      Sistema Aberto de Gestão Universitaria Institucional
    </a>
  </aside>
  <nav>
    <h6 className="footer-title">Serviços</h6>
    <a className="link link-hover" href="/sobre">Sobre</a>
  </nav>
  {/* <nav>
    <h6 className="footer-title">Company</h6>
    <a className="link link-hover">About us</a>
    <a className="link link-hover">Contact</a>
    <a className="link link-hover">Jobs</a>
    <a className="link link-hover">Press kit</a>
  </nav>
  <nav>
    <h6 className="footer-title">Legal</h6>
    <a className="link link-hover">Terms of use</a>
    <a className="link link-hover">Privacy policy</a>
    <a className="link link-hover">Cookie policy</a>
  </nav> */}
</footer>
  );
}