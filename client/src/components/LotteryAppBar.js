import React from "react";
import ConnectButton from "./ConnectButton";
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles({
    menuButton: {
        marginRight: 2,
      },
      title: {
        flexGrow: 1,
      },
});

export default function LotteryAppBar() {

    const classes = useStyles()

    return(
        <AppBar position="flex">
            <Toolbar>

                <Typography variant="h6" align="center" className={classes.title} >
                    Lottery
                </Typography>


                <ConnectButton>
                </ConnectButton>

            </Toolbar>
        </AppBar>
    )
}