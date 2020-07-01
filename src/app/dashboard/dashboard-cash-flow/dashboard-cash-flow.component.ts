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

    private minDate: moment.Moment = moment();
    private maxDate: moment.Moment = moment();
    private buckets = {};

    constructor(private dataService: DataService) { }

    ngOnInit() {

        this.dataService.transactionsChanged.subscribe(e => {
            this.updateBuckets(e);
            this.reloadChart();
        });

        this.dataService.selectedCurrencyChanged.subscribe(e => {
            this.reloadChart();
        });

        this.updateBuckets(this.dataService.getTransactions());
        this.reloadChart();
    }

    onResolutionChange(r: string) {
        this.resolution = r;
        this.reloadChart();
    }

    private reloadChart() {

        let labels = _.uniq(this.getAllDaysBetween(this.minDate, this.maxDate)
            .map(d => d.format(this.resolution)));
        let datasets = this.getDatasets(this.minDate, this.maxDate);

        this.drawChart(labels, datasets);
    }

    private updateBuckets(transactions: Transaction[]) {
        let changePerDay = {};
        transactions = _.sortBy(transactions, t => t.date);
        transactions.forEach(t => {
            let dayKey = moment(t.date).format("YYYY-MM-DD");

            if (!changePerDay[t.accountGuid]) {
                changePerDay[t.accountGuid] = {};
            }

            if (!changePerDay[t.accountGuid][dayKey]) {
                changePerDay[t.accountGuid][dayKey] = 0;
            }

            changePerDay[t.accountGuid][dayKey] += t.amount;
        });

        this.minDate = moment();
        this.maxDate = moment();
        if(transactions.length > 0) {
            this.minDate = moment(_.minBy(transactions, t => t.date).date) || moment();
            this.maxDate = moment(_.maxBy(transactions, t => t.date).date) || moment();
        }

        let accounts = this.dataService.getAccounts();
        let allDays = this.getAllDaysBetween(this.minDate, this.maxDate);

        let selectedCurrency = this.dataService.getSelectedCurrency();
        this.buckets = {};
        accounts.forEach(a => {
            this.buckets[a.guid] = {};
            let sum = 0;
            let rate = this.dataService.getExchangeRate(a.currency, selectedCurrency)
            allDays.forEach(d => {
                let dayKey = d.format("YYYY-MM-DD");
                let monthKey = d.format("YYYY-MM");
                let yearKey = d.format("YYYY");

                if (changePerDay[a.guid] && changePerDay[a.guid][dayKey]) {
                    sum += changePerDay[a.guid][dayKey];
                }

                let normalizedValue = Math.round(sum * rate * 100) / 100;
                this.buckets[a.guid][dayKey] = normalizedValue;

                //aggregate by month and year
                if (!this.buckets[a.guid][monthKey]) {
                    this.buckets[a.guid][monthKey] = 0;
                }
                if (!this.buckets[a.guid][yearKey]) {
                    this.buckets[a.guid][yearKey] = 0;
                }

                this.buckets[a.guid][monthKey] = normalizedValue;
                this.buckets[a.guid][yearKey] = normalizedValue;
            });
        });
    }

    private getDatasets(from: moment.Moment, to: moment.Moment) {

        let keys = _.uniq(this.getAllDaysBetween(from, to).map(d => d.format(this.resolution)));
        let accounts = this.dataService.getAccounts();

        let total = {};
        let datasets = [];
        accounts.forEach(a => {
            let data = [];
            keys.forEach(key => {
                data.push(this.buckets[a.guid][key]);

                if (!total[key]) {
                    total[key] = 0;
                }
                total[key] += this.buckets[a.guid][key];
            });

            //TODO: account color, if null then fallback random color
            let randomR = Math.random() * 255;
            let randomG = Math.random() * 255;
            let randomB = Math.random() * 255;

            datasets.push({
                label: a.name,
                lineTension: 0,
                backgroundColor: `rgba(${randomR}, ${randomG}, ${randomB}, 0.5)`,
                borderColor: `rgb(${randomR}, ${randomG}, ${randomB})`,
                data: data
            });
        });

        datasets.push({
            label: "Total",
            lineTension: 0,
            backgroundColor: 'rgba(255, 0, 0, 0)',
            borderColor: 'rgb(255, 0, 0)',
            data: Object.values(total).map(v => Math.round((v as number) * 100) / 100)
        });

        return datasets;
    }

    private getAllDaysBetween(min: moment.Moment, max: moment.Moment): moment.Moment[] {
        let result: moment.Moment[] = [];

        let d = moment(min).clone();
        while (d <= moment(max)) {
            result.push(d);
            d = d.add(1, 'day').clone();
        }

        return result;
    }

    private drawChart(labels, datasets) {
        if (this.chart) {
            this.chart.data.labels = labels;
            this.chart.data.datasets = datasets;
            this.chart.update(0);
        } else {
            this.chart = new Chart('chart', {
                // The type of chart we want to create
                type: 'line',
                // The data for our dataset
                data: {
                    labels: labels,
                    datasets: datasets
                },
                // Configuration options go here
                options: {}
            });
        }
    }
}
