// Hybrid
import { motion } from "motion/react"
import RunningStickFigureSvg from "../components/RunningStickFigureSvg";

 
// Element(s)
const box = document.getElementById("box")

 const Landing = () => {

    return (
        <>
        <article>
                 <h1> Robert Sima </h1>
                 <p> Welcome to my portfolio</p>
        </article>

        <div className="sticky-bottom-element">
            <RunningStickFigureSvg />
        </div>
    </>
);

};

export default Landing;