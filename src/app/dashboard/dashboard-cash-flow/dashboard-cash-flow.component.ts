import { Chart } from 'chart.js'
import * as _ from 'lodash'
import * as moment from 'moment'

import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/data/data.service';
import { Transaction } from 'src/app/models/transaction.model';

@Component({
    selector: 'app-dashboard-cash-flow',
    templateUrl: './dashboard-cash-flow.component.html'
})
export class DashboardCashFlowComponent implements OnInit {

    resolution: string = 'YYYY-MM';

    chart = null;

    constructor(private dataService: DataService) { }

    ngOnInit() {

        this.dataService.transactionsChanged.subscribe(e => this.reloadChart());
        this.dataService.selectedCurrencyChanged.subscribe(e => this.reloadChart());

        this.reloadChart();
    }

    onResolutionChange(r: string) {
        this.resolution = r;
        this.reloadChart();
    }

    private reloadChart() {
        let XY = this.getChartData(this.dataService.getTransactions(), this.resolution);
        this.drawChart(XY[0], XY[1]);
    }

    private getChartData(transactions: Transaction[], resolution: string) {
        let selectedCurrency = this.dataService.getSelectedCurrency();
        let narmalized = transactions.map(t => {
            let rate = this.dataService.getExchangeRate(t.currency, selectedCurrency);
            return { date: t.date, amount: Math.round(t.amount * rate * 100) / 100 }
        })

        let groups = _.groupBy(narmalized, t => moment(t.date).format(resolution));

        let XY = _.unzip(Object.keys(groups).sort().map(k => [k, _.sumBy(groups[k], t => t.amount)]));

        let dataX = XY[0];

        let sum = 0
        let dataY = XY[1].map(a => {
            sum += a as number;
            return Math.round(sum * 100) / 100;
        });

        return [dataX, dataY];
    }

    private drawChart(labels, data) {
        if(this.chart) {
            this.chart.data.labels = labels;
            this.chart.data.datasets[0].data = data;
            this.chart.update(0);
        } else {
            this.chart = new Chart('chart', {
                // The type of chart we want to create
                type: 'line',
    
                // The data for our dataset
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'All Accounts',
                        lineTension: 0,
                        backgroundColor: 'rgba(255, 99, 132, 0.5)',
                        borderColor: 'rgb(255, 99, 132)',
                        data: data
                    }]
                },
    
                // Configuration options go here
                options: {}
            });
        }

    }
}
