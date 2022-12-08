import React from "react";
import { useNavigate } from 'react-router-dom';

import styles3 from "./Button.module.css";
interface Props {
    to: string;
    queryParamString?: string;
    isParamButton?: boolean;
}
const Button = ({
    to,
    queryParamString,
    isParamButton,
}: Props) => {
    const navigate = useNavigate();

    return (
        <button
        className={styles3["param-btn"]}
      onClick={() => navigate(to + "?" + queryParamString)}
    >
      Go!
    </button>
    )
}

export default Button;