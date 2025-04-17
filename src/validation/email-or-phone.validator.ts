import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
} from 'class-validator';

export function IsEmailOrPhone(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isEmailOrPhone',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any) {
                    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
                    const isPhone = /^\+?\d{10,15}$/.test(value);
                    return isEmail || isPhone;
                },
                defaultMessage(args: ValidationArguments) {
                    return `${args.property} должен быть валидным email или номером телефона`;
                },
            },
        });
    };
}
