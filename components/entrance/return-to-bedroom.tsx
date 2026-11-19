"use client"

import { useRouter } from "next/navigation"
import styles from "./return-to-bedroom.module.css"

export default function ReturnToBedroom() {
  const router = useRouter()

  function returnToBedroom() {
    if (sessionStorage.getItem("portfolio-entered-from-bedroom")) {
      sessionStorage.removeItem("portfolio-entered-from-bedroom")
      router.back()
      return
    }
    router.push("/")
  }

  return (
    <button className={styles.back} type="button" onClick={returnToBedroom}>
      <span aria-hidden="true">←</span> Voltar ao quarto
    </button>
  )
}

