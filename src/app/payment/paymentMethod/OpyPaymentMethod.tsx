import { CustomError, PaymentInitializeOptions } from '@bigcommerce/checkout-sdk';
import { noop } from 'lodash';
import React, { useCallback, FunctionComponent } from 'react';
import { Omit } from 'utility-types';

import { withLanguage, TranslatedString, WithLanguageProps } from '../../locale';
import { LoadingOverlay } from '../../ui/loading';

import getPaymentMethodName from './getPaymentMethodName';
import HostedWidgetPaymentMethod , { HostedWidgetPaymentMethodProps } from './HostedWidgetPaymentMethod';

export type OpyPaymentMethodProps = Omit<HostedWidgetPaymentMethodProps, 'containerId'>;

const OpyPaymentMethod: FunctionComponent<OpyPaymentMethodProps & WithLanguageProps> = ({
    initializePayment,
    method,
    language,
    isInitializing = false,
    onUnhandledError = noop,
    ...rest
}) => {
    const containerId = 'learnMoreButton';
    const methodName = getPaymentMethodName(language)(method);
    const initializeOpyPayment = useCallback((options: PaymentInitializeOptions) => initializePayment({
        ...options,
        opy: {
            containerId,
        },
    }), [initializePayment]);
    const onUnhandledOpyError = useCallback((error: CustomError) => {
        if (error.type === 'opy_error' && error.subtype === 'invalid_cart') {
            error.message = language.translate('payment.opy_invalid_cart_error', { methodName });
        }

        onUnhandledError(error);
    }, [language, methodName, onUnhandledError]);

    return (
      <LoadingOverlay hideContentWhenLoading isLoading={ isInitializing }>
        <strong>
            <TranslatedString id="payment.opy_widget_slogan" />
        </strong>
        <div style={ { display: 'inline-block', marginLeft: '0.5rem' } }>
            <HostedWidgetPaymentMethod
                { ...rest }
                containerId={ containerId }
                hideWidget={ isInitializing }
                initializePayment={ initializeOpyPayment }
                method={ method }
                onUnhandledError={ onUnhandledOpyError }
            />
        </div>
        <p>
            <TranslatedString
                data={ { methodName } }
                id="payment.opy_widget_info"
            />
        </p>
      </LoadingOverlay>
    );
};

export default withLanguage(OpyPaymentMethod);
