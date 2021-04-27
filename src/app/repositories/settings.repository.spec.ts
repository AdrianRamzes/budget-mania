import { Currency } from '../models/currency.enum';
import { SettingsRepository } from './settings.repository';

describe('Settings Repository', () => {

    beforeEach(() => localStorage.clear());

    afterEach(() => localStorage.clear());

    it('SelectedCurrency returns default value when not set', async () => {
        const repository = new SettingsRepository();

        expect(repository.getSelectedCurrency()).toBe(Currency.EUR);
    });

    it('SelectedCurrency returns correct value when set', async () => {
        const repository = new SettingsRepository();

        repository.setSelectedCurrency(Currency.PLN);

        expect(repository.getSelectedCurrency()).toBe(Currency.PLN);
    });

    it('SelectedCurrency returns correct value when set was called multiple times', async () => {
        const repository = new SettingsRepository();

        repository.setSelectedCurrency(Currency.PLN);
        repository.setSelectedCurrency(Currency.CZK);

        expect(repository.getSelectedCurrency()).toBe(Currency.CZK);
    });

    it('SelectedCurrency does not depend on repository instance', async () => {
        const repository1 = new SettingsRepository();
        repository1.setSelectedCurrency(Currency.PLN);

        const repository2 = new SettingsRepository();

        expect(repository2.getSelectedCurrency()).toBe(Currency.PLN);
    });

    it('emits event when SelectedCurrency is set', () => {
        const repository = new SettingsRepository();
        spyOn(repository.changed, 'emit').and.callThrough();

        repository.setSelectedCurrency(Currency.PLN);

        expect(repository.changed.emit).toHaveBeenCalledWith('selected-currency');
    });

    it('emits event when SelectedCurrency is set multiple times', () => {
        const repository = new SettingsRepository();
        spyOn(repository.changed, 'emit').and.callThrough();

        repository.setSelectedCurrency(Currency.PLN);
        repository.setSelectedCurrency(Currency.RON);
        repository.setSelectedCurrency(Currency.RUB);

        expect(repository.changed.emit).toHaveBeenCalledTimes(3);
    });

    it('does not emit event when SelectedCurrency is read', () => {
        const repository = new SettingsRepository();
        spyOn(repository.changed, 'emit').and.callThrough();

        repository.getSelectedCurrency();
        repository.getSelectedCurrency();
        repository.getSelectedCurrency();

        expect(repository.changed.emit).not.toHaveBeenCalled();
    });
});