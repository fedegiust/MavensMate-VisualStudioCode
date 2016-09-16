'use strict';
import { window, OutputChannel, Disposable } from 'vscode';
import { MavensMateClient } from '../../src/mavensmate/mavensMateClient';
import Command from '../../src/mavensmate/command';
import Promise = require('bluebird');

export class MavensMateChannel implements Disposable {
    channel: OutputChannel;
    waitingOnCount: number;
    waitingDelay: number;
    isShowing: boolean;
    isWaiting: boolean;
    
    static Create(){
        return new MavensMateChannel();
    }
    
    constructor(){
        this.channel = window.createOutputChannel('MavensMate');
        this.waitingOnCount = 0;
        this.waitingDelay = 5000;
        this.isShowing = false;
        this.isWaiting = false;
    }

    appendStatus(message: string){
        return this.appendLine(message, 'STATUS');
    }

    appendError(message: string){
        return this.appendLine(message, 'ERROR');
    }

    appendLine(message: string, level?: string){
        return Promise.resolve().then(() => {
            let tabs = (level && level.length > 5 ? 1 : 2);
            let formattedMessage = `${ '\t'.repeat(tabs) }${message}`;
            if(level){
                formattedMessage = `[${level}]${formattedMessage}`;
            }
            this.channel.appendLine(formattedMessage);
            
            this.show();

            if(this.waitingOnCount == 0 && this.isWaiting == false){
                this.isWaiting = true;
                return Promise.delay(this.waitingDelay).then(() => {
                    if(this.waitingOnCount == 0){
                        this.hide();
                        this.isWaiting = false;
                    }
                });
            } else {
                return null;
            }
        });
    }

    show(){
        this.channel.show();
        this.isShowing = true;
    }

    hide(){
        this.channel.hide();
        this.isShowing = false;
    }

    toggle(): Thenable<any>{
        if(this.isShowing){
            this.hide();
            return Promise.resolve();
        } else {
            this.waitingOnCount++;
            this.show();
            return Promise.delay(this.waitingDelay).then(() => {
                this.waitingOnCount--;
            });
        }
    }

    dispose(){
        this.channel.dispose();
    }
}