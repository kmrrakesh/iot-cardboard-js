import { useEffect, useRef } from 'react';
import { CancelledPromiseError } from '../Classes/Errors';
import { ICancellablePromise } from '../Constants/Interfaces';
import { CancellablePromise } from '../Constants/Types';

/** Wraps promise with logic that allows for promise cancellation via cancel() method */
export function makeCancellable<T>(
    promise: Promise<T>,
    promisesRef?: React.MutableRefObject<any>
): CancellablePromise<T> {
    let isCancelled = false;
    let returnValue: CancellablePromise<T> = {
        promise: null,
        cancel: () => null
    };

    const wrappedPromise = new Promise<T>((resolve, reject) => {
        async function executePromise() {
            try {
                const val = await promise;
                if (isCancelled) {
                    reject(new CancelledPromiseError());
                } else {
                    resolve(val);
                }
            } catch (error) {
                if (isCancelled) {
                    reject(new CancelledPromiseError());
                } else {
                    reject(error);
                }
            }
            // Remove promise from promisesRef.current list once resolved/rejected
            if (
                promisesRef &&
                promisesRef.current.indexOf(returnValue) !== -1
            ) {
                promisesRef.current = promisesRef.current.filter(
                    (promise) => promise !== returnValue
                );
            }
        }
        executePromise();
    });

    returnValue = {
        promise: wrappedPromise,
        cancel() {
            isCancelled = true;
        }
    };

    return returnValue;
}

/**
 * Exposes two functions: 'cancellablePromise' to wrap promises in cancellation code which auto cancels on unmount,
 * and 'cancel' function to manually cancel wrapped promises.  This hooks was adapted from the following repo:
 * https://github.com/rajeshnaroth/react-cancelable-promise-hook/blob/master/index.js
 */
const useCancellablePromise = () => {
    const promises = useRef(null);

    /** Cancel all active promises constructed by this hook's consumer */
    function cancel() {
        promises.current.forEach((p) => p.cancel());
        promises.current = [];
    }

    // On unmount, cancel promises
    useEffect(() => {
        promises.current = promises.current || [];
        return cancel;
    }, []);

    /** Function to construct cancellable promise if it is not already */
    function cancellablePromise<T>(p: Promise<T> | ICancellablePromise<T>) {
        const isICancellablePromise =
            p['cancel'] && typeof p['cancel'] === 'function';
        const cPromise = !isICancellablePromise
            ? makeCancellable(p, promises)
            : (p as ICancellablePromise<T>);
        promises.current.push(cPromise);
        return !isICancellablePromise
            ? (cPromise as CancellablePromise<T>).promise
            : (p as ICancellablePromise<T>);
    }

    return { cancellablePromise, cancel };
};

export default useCancellablePromise;
