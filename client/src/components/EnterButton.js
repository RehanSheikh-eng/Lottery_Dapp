import React from "react";
import { useEffect, useState } from "react";
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import { Typography } from "@material-ui/core";

const useStyles = makeStyles({
    dialogTitle: {
        flex: "1 1 0%",
        color: ""
    },
    dialogTitleBox: {
        background: "linear-gradient(111.68deg, rgb(246 246 246) 0%, rgb(232, 242, 246) 100%)",
        alignItems: "center",
        width: "auto",
        justifyContent: "space-between",
        borderBottom: "1px solid rgb(231, 227, 235)",
        display: "flex",
        padding: "12px 24px",
        WebkitBoxAlign: "center",
    },
    dialogTitleCloseButton: {
        width: 48,
        float: "right",
    },
    dialogContentDescription: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 8,
    },

    dialogContentDescriptionBuy: {
        color: "rgb(122, 110, 170)",
        fontSize: 16,
        fontWeight: 400,
        lineHeigh: 1.5,
    },

    dialogContentDescriptionTicket: {
        minWidth: 70,
        alignItems: "center",
        color: "rgb(40, 13, 95)",
        fontSize: 16,
        fontWeight: 600,
        lineHeight: 1.5,
        marginRight: 4,
    },

    dialogContentTextBox: {
        backgroundColor: "rgb(238, 234, 244)",
        border: "1px solid rgb(215, 202, 236)",
        borderRadius: "16px",
        boxShadow: "rgb(237 75 158) 0px 0px 0px 1px, rgb(237 75 158 / 20%) 0px 0px 0px 4px",
        padding: "8px 16px",
    },

    dialogInput: {
        background: "#00000000",
        borderRadius: "0px",
        boxShadow: "none",
        paddingLeft: "0px",
        paddingRight: "0px",
        textAlign: "right",
        border: "none",
    }

});

export default function EnterButton(){
    const [open, setOpen] = useState(true);
    const [numtickets, setNumTickets] = useState(0);

    const classes = useStyles();

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClickClose = () => {
        setOpen(false);
    };

    const handleInputChange = (e) => {
        setNumTickets(e.target.value)
    };
    return (
        <div>
          <Button variant="outlined" color="primary" onClick={handleClickOpen}>
            Open form dialog
          </Button>
          <Dialog 
            open={open} 
            onClose={handleClickClose} 
            aria-labelledby="form-dialog-title"
            PaperProps={{
                style: {
                    minWidth: 280,
                    maxWidth: 350,
                    width: "auto",
                    borderRadius: 32,
                    height: "80vh"
                }
            }}
            >
            <DialogTitle 
                id="form-dialog-title"
                style={{padding: 0}}
            >
                <div className={classes.dialogTitleBox}>
                    <div className={classes.dialogTitle}>
                        <Typography 
                            variant="h6"
                            style={{fontWeight: 600}}
                        >
                            Buy Tickets
                        </Typography>
                    </div>
                    <div>        
                        <IconButton 
                        aria-label="close" 
                        onClick={handleClickClose}
                        >
                            <CloseIcon />
                        </IconButton>
                    </div>
                </div>
            </DialogTitle>
            <DialogContent
                style={{
                    padding: 24
                }}>
                <div className={classes.dialogContentDescription}>
                    <div className={classes.dialogContentDescriptionBuy}>
                        Buy:
                    </div>
                    <div className={classes.dialogContentDescriptionTicket}>
                        Tickets
                    </div>
                </div>
                <div className={classes.dialogContentTextBox}>
                    <div style={{display: "flex", justifyContent: "flex-end"}}>
                        <div style={{display: "flex", alignItems: "center"}}>
                            <input
                                className={classes.dialogInput}
                                inputMode="decimal"
                                min="0"
                                placeholder="0"
                                pattern="^[0-9]*[.,]?[0-9]{0,18}$"
                                value={numtickets}
                                onChange={handleInputChange}/>
                        </div>
                        <div>

                        </div>
                    </div>
                </div>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClickClose} color="primary">
                Cancel
              </Button>
              <Button onClick={handleClickClose} color="primary">
                Buy Tickets
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      );

}