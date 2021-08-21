import React from "react"
import './App.css'
import Balance from "./components/Balance"
import LotteryAppBar from "./components/LotteryAppBar"
export default function App() {

    return(
        <div>
            <nav>
                <LotteryAppBar></LotteryAppBar>
            </nav>
            <div>
                <div>
                    <div className="main_page">
                        <div className="call_to_action_text">
                            <h2> Get Your Tickets Now!</h2>
                        </div>
                        <div>
                            <Balance></Balance>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                LOTTERY HUB
            </div>
        </div>
    )

}