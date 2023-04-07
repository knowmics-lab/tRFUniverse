/* eslint-disable react/jsx-no-target-blank */
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";

export default function MainFooter() {
    return (
        <footer className="footer pt-3">
            <div className="container-fluid">
                <div className="row align-items-center justify-content-lg-between">
                    <div className="col-lg-6 mb-lg-0 mb-4">
                        <div className="copyright text-center text-sm text-muted text-lg-start">
                            © {new Date().getFullYear()} - S. Alaimo, Ph.D.,
                            {" theme made with "}
                            <FontAwesomeIcon icon={faHeart} />
                            {" by "}
                            <a href="https://www.creative-tim.com" className="font-weight-bold" target="_blank">
                                Creative Tim
                            </a>
                            .
                        </div>
                    </div>
                    <div className="col-lg-6">
                        <ul className="nav nav-footer justify-content-center justify-content-lg-end">
                            <li className="nav-item">
                                <Link href="/about">
                                    <a className="nav-link text-muted">About Us</a>
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link href="/license">
                                    <a className="nav-link pe-0 text-muted">License</a>
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </footer>
    );
}
