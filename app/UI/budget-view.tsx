"use client";
import { ChartPieIcon } from "@heroicons/react/24/solid";
import { useEffect, useRef, useState } from "react";
import { Input } from "./input";
import {
  inital_res,
  montOrderShort,
  monthOrder,
  today,
  todayString,
} from "../lib/utils";
import { z } from "zod";
import {
  amountSchema,
  dateSchema,
  userSchema,
} from "../lib/validation-schemas";
import { useFormState } from "react-dom";
import { addEntry, deleteEntries } from "../lib/action";
import { Purchace } from "../main/[budgetID]/page";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MinusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import React from "react";
import { ClipLoader } from "react-spinners";

type Errors = {
  date?: string[] | undefined;
  store?: string[] | undefined;
  amount?: string[] | undefined;
};

export default function BudgetView({
  budget,
  entries,
  years,
}: {
  budget: {
    id: string;
    name: string;
    ownerId: string;
  };
  entries: Purchace[];
  years: number[];
}) {
  const [selectedYear, setSelectedYear] = useState(
    years.length > 0 ? years[years.length - 1] : today.getFullYear(),
  );
  const [openMonth, setOpenMonth] = useState("");

  //year slider
  const [yearIndex, setYearIndex] = useState(0);
  const [yearWindowSize, setYearWindowSize] = useState(5);
  const [yearSliderTouch, setYearSliderTouch] = useState(0);
  const [loadingSlider, setLoadingSlider] = useState(true);

  const changeSelectedYear = (year: number) => {
    setSelectedYear(year);
    const newDateAsArray = date.split("-");
    newDateAsArray[0] = year.toString();
    setDate(newDateAsArray.join("-"));
    setOpenMonth("");
  };

  const yearFilterdContent = entries.filter(
    (entry) => entry.date.getFullYear() === selectedYear,
  );

  //extract months
  const months = [
    ...new Set(
      yearFilterdContent.map((entry) => monthOrder[entry.date.getMonth()]),
    ),
  ].sort((a, b) => monthOrder.indexOf(b) - monthOrder.indexOf(a));

  //content filter
  const selectedContent = yearFilterdContent.filter(
    (entry) => monthOrder[entry.date.getMonth()] === openMonth,
  );

  useEffect(() => {
    //year slider
    if (years.length - yearIndex - 1 < years.indexOf(selectedYear)) {
      setSelectedYear(years[years.length - yearIndex - 1]);
      setOpenMonth("");
      setCheckBoxOn(false);
    } else if (
      years.length - yearWindowSize - yearIndex >
      years.indexOf(selectedYear)
    ) {
      setSelectedYear(years[years.length - yearWindowSize - yearIndex]);
      setOpenMonth("");
      setCheckBoxOn(false);
    }

    //reset on year delete
    if (!years.includes(selectedYear)) {
      setSelectedYear(
        years.length > 0 ? years[years.length - 1] : today.getFullYear(),
      );
      setDate(todayString);
      setOpenMonth("");
      setYearIndex(0);
    }
  }, [yearIndex, selectedYear, years, yearWindowSize]);

  //scroll
  const scrollContent = useRef(null);
  useEffect(() => {
    const scrollToElement = scrollContent.current;
    if (scrollToElement)
      (scrollToElement as HTMLParagraphElement).scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    scrollContent.current = null;
    setLoadingSlider(false);
  }, []);

  //CheckBox
  const purcahseIDs = selectedContent.map((entry) => entry.id);
  const [checkBoxOn, setCheckBoxOn] = useState(false);
  const [selectedPurchases, setSelectedPurchases] = useState<string[]>([]);
  const allPurcahsesSelected =
    purcahseIDs.filter((id) => selectedPurchases.indexOf(id) > -1).length ===
    purcahseIDs.length;
  useEffect(() => {
    if (!checkBoxOn) setSelectedPurchases([]);
  }, [checkBoxOn]);

  //move slider
  const stores = [...new Set(entries.map((entry) => entry.store))];
  //
  //
  //
  //purcahse form
  const [date, setDate] = useState(todayString);
  const [store, setStore] = useState("");
  const [amount, setAmount] = useState<number | string>("");
  const [response, dispatch] = useFormState(
    addEntry.bind(null, budget.id),
    inital_res,
  );
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && yearWindowSize !== 5) setYearWindowSize(5);
      else if (window.innerWidth <= 768 && yearWindowSize !== 3)
        setYearWindowSize(3);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [yearWindowSize]);

  useEffect(() => {
    if (response.success) {
      const [resYear, resMonth] = response.msg.split("-");
      if (
        years.length - yearWindowSize - yearIndex >
        years.indexOf(Number(resYear))
      )
        setYearIndex(
          years.length - yearWindowSize - years.indexOf(Number(resYear)),
        );
      else if (years.length - yearIndex - 1 < years.indexOf(Number(resYear)))
        setYearIndex(
          yearIndex -
            (years.indexOf(Number(resYear)) - (years.length - yearIndex - 1)),
        );
      setSelectedYear(Number(resYear));
      setOpenMonth(resMonth);
      setStore("");
      setAmount("");
      response.success = false;
      response.msg = "";
      document.querySelectorAll("input").forEach((input) => input.blur());
    }
  }, [response, years, yearIndex, yearWindowSize]);

  return (
    <>
      <div className="grow xl:overflow-y-auto">
        <h1 className="flex items-center justify-center space-x-4 py-8 text-center text-2xl sm:p-8 md:text-4xl">
          <ChartPieIcon className="h-8 w-8" />
          <p>{budget.name}</p>
        </h1>

        {years.length > 0 ? (
          <div className="flex flex-col items-center">
            {/* Year slider */}
            {loadingSlider ? (
              <p className="flex min-h-[40px] w-full items-center justify-center text-primary-500">
                Loading...
              </p>
            ) : (
              <div
                className="flex w-full items-center justify-evenly"
                onWheel={(e) => {
                  if (e.deltaY > 0)
                    setYearIndex(
                      yearIndex < years.length - yearWindowSize
                        ? yearIndex + 1
                        : years.length - yearWindowSize,
                    );
                  else setYearIndex(yearIndex > 0 ? yearIndex - 1 : 0);
                }}
                onTouchStart={(e) => setYearSliderTouch(e.touches[0].clientX)}
                onTouchEnd={(e) => {
                  const changeX = e.changedTouches[0].clientX - yearSliderTouch;
                  if (Math.abs(changeX) > 50) {
                    if (changeX > 0)
                      setYearIndex(
                        yearIndex < years.length - yearWindowSize
                          ? yearIndex + 1
                          : years.length - yearWindowSize,
                      );
                    else setYearIndex(yearIndex > 0 ? yearIndex - 1 : 0);
                  }
                  setYearSliderTouch(0);
                }}
              >
                {years.length > yearWindowSize ? (
                  <>
                    <ChevronLeftIcon
                      onClick={() =>
                        setYearIndex(
                          yearIndex < years.length - yearWindowSize
                            ? yearIndex + 1
                            : years.length - yearWindowSize,
                        )
                      }
                      className={`${
                        yearIndex === years.length - yearWindowSize
                          ? "pointer-events-none text-dark-300"
                          : ""
                      } h-6 w-6 cursor-pointer hover:text-primary-500`}
                    />
                    {years
                      .slice(
                        years.length - yearWindowSize - yearIndex,
                        years.length - yearIndex,
                      )
                      .map((year) => (
                        <p
                          onClick={() => changeSelectedYear(year)}
                          className={`cursor-pointer select-none px-6 py-2 hover:text-primary-600 ${
                            year === selectedYear ? "text-primary-500" : ""
                          } ${
                            yearSliderTouch !== 0 ? "pointer-events-none" : ""
                          }`}
                          key={year}
                        >
                          {year}
                        </p>
                      ))}
                    <ChevronRightIcon
                      onClick={() =>
                        setYearIndex(yearIndex > 0 ? yearIndex - 1 : 0)
                      }
                      className={`${
                        yearIndex === 0
                          ? "pointer-events-none text-dark-300"
                          : ""
                      } h-6 w-6 cursor-pointer hover:text-primary-500`}
                    />
                  </>
                ) : (
                  years.map((year) => (
                    <p
                      onClick={() => changeSelectedYear(year)}
                      className={`cursor-pointer px-6 py-2 hover:text-primary-600 ${
                        year === selectedYear ? "text-primary-500" : ""
                      }`}
                      key={year}
                    >
                      {year}
                    </p>
                  ))
                )}
              </div>
            )}

            {/* 
                Year Content
            */}
            <div className="flex w-full flex-col md:p-8">
              {months.map((month: string) => (
                <div key={month}>
                  {/* Month Header */}
                  <div
                    className="mx-2 my-4 flex cursor-pointer select-none justify-between rounded border-2 border-primary-500 p-4 hover:bg-dark-200"
                    onClick={() => {
                      if (month === openMonth) setOpenMonth("");
                      else {
                        setOpenMonth(month);
                        const newDateAsArray = date.split("-");
                        newDateAsArray[1] = String(
                          monthOrder.indexOf(month) + 1,
                        ).padStart(2, "0");
                        setDate(newDateAsArray.join("-"));
                      }
                      setCheckBoxOn(false);
                    }}
                    key={month}
                  >
                    <p>{month}</p>
                    {month === openMonth ? (
                      <MinusIcon className="h-6 w-6" />
                    ) : (
                      <ChevronDownIcon className="h-6 w-6" />
                    )}
                  </div>

                  {/* Table */}
                  {month === openMonth ? (
                    <div
                      className={`mx-2 my-4 grid grid-cols-${
                        checkBoxOn ? "[7%_31%_31%_31%]" : "3"
                      }  p-4 text-center`}
                    >
                      {/* Table Header */}
                      <p
                        className={`p-4 text-primary-500 ${
                          checkBoxOn ? "col-start-2" : ""
                        }`}
                      >
                        Date
                      </p>
                      <p className="p-4 text-primary-500">Store</p>
                      <p className="p-4 text-primary-500">Amount</p>

                      {/* Table Body */}
                      {selectedContent.map(
                        ({ id, amount, date, store }, index) => (
                          <React.Fragment key={id}>
                            {checkBoxOn ? (
                              <div
                                className={`flex items-center justify-center rounded-bl-lg rounded-tl-lg ${
                                  index % 2 === 0 ? "bg-dark-200" : ""
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  id={`checkbox-${index}`}
                                  checked={selectedPurchases.includes(id)}
                                  className="h-5 w-5 rounded-2xl accent-primary-400"
                                  onChange={() => {
                                    if (selectedPurchases.includes(id))
                                      setSelectedPurchases(
                                        selectedPurchases.filter(
                                          (fidlerId) => fidlerId !== id,
                                        ),
                                      );
                                    else
                                      setSelectedPurchases([
                                        ...selectedPurchases,
                                        id,
                                      ]);
                                  }}
                                />
                              </div>
                            ) : (
                              <></>
                            )}
                            <p
                              key={id + 1}
                              className={`overflow-auto p-4 ${
                                checkBoxOn ? "" : "rounded-bl-lg rounded-tl-lg"
                              } ${index % 2 === 0 ? "bg-dark-200" : ""}`}
                            >
                              {`${String(date.getDay()).padStart(2, "0")} ${
                                montOrderShort[date.getMonth()]
                              }`}
                            </p>
                            <p
                              key={id + 2}
                              className={`overflow-auto p-4 ${
                                index % 2 === 0 ? "bg-dark-200" : ""
                              }`}
                            >
                              {store}
                            </p>
                            <p
                              key={id + 3}
                              className={`overflow-auto rounded-br-lg rounded-tr-lg p-4 ${
                                index % 2 === 0 ? "bg-dark-200" : ""
                              }`}
                            >
                              {amount}
                            </p>
                          </React.Fragment>
                        ),
                      )}

                      {/* Table tail */}
                      {checkBoxOn ? (
                        <>
                          <div
                            className={`flex items-center justify-center rounded-bl-lg rounded-tl-lg ${
                              selectedContent.length % 2 === 0
                                ? "bg-dark-200"
                                : ""
                            }`}
                          >
                            <input
                              type="checkbox"
                              id={`checkbox-${selectedContent.length}`}
                              className="h-5 w-5 rounded-2xl accent-primary-400"
                              checked={allPurcahsesSelected}
                              onChange={() => {
                                if (allPurcahsesSelected)
                                  setSelectedPurchases([]);
                                else setSelectedPurchases([...purcahseIDs]);
                              }}
                            />
                          </div>
                          <div
                            className={`flex items-center justify-evenly space-x-4 ${
                              selectedContent.length % 2 === 0
                                ? "bg-dark-200"
                                : ""
                            }`}
                          >
                            <XMarkIcon
                              className="c h-8 w-8 cursor-pointer text-primary-500 hover:text-primary-600"
                              onClick={() => setCheckBoxOn(false)}
                            />
                            <div className="flex items-center justify-center space-x-2">
                              <TrashIcon
                                className={`h-8 w-8 ${
                                  selectedPurchases.length > 0
                                    ? "cursor-pointer text-primary-500 hover:text-primary-600"
                                    : "text-dark-500"
                                }`}
                                onClick={() => {
                                  if (selectedPurchases.length > 0) {
                                    deleteEntries(budget.id, selectedPurchases);
                                    setCheckBoxOn(false);
                                  }
                                }}
                              />
                              <p className="select-none">
                                ({selectedPurchases.length})
                              </p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div
                          className={`flex items-center justify-center rounded-bl-lg rounded-tl-lg ${
                            selectedContent.length % 2 === 0
                              ? "bg-dark-200"
                              : ""
                          }`}
                        >
                          <PencilIcon
                            className="c h-8 w-8 cursor-pointer text-primary-500 hover:text-primary-600"
                            onClick={() => setCheckBoxOn(true)}
                          />
                        </div>
                      )}
                      <p
                        className={`p-4 ${
                          selectedContent.length % 2 === 0 ? "bg-dark-200" : ""
                        }`}
                        ref={checkBoxOn ? null : scrollContent}
                      >
                        Total:
                      </p>
                      <p
                        className={`rounded-br-lg rounded-tr-lg p-4 ${
                          selectedContent.length % 2 === 0 ? "bg-dark-200" : ""
                        }`}
                      >
                        {selectedContent.reduce(
                          (sum, entry) => sum + entry.amount,
                          0,
                        )}
                      </p>
                    </div>
                  ) : (
                    <></>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="py-12 text-center text-2xl">No purchases yet!</p>
        )}
      </div>

      {/* Purchase Form */}
      <form
        autoComplete="off"
        noValidate
        className="flex w-full flex-col space-y-2 px-2 py-6 md:w-72 xl:h-full xl:w-96 xl:space-y-4 xl:px-8 2xl:py-36 "
        onSubmit={(e) => {
          e.preventDefault();
          const payload = {
            date: new Date(date),
            store,
            amount: Number(amount),
          };
          const parsedFields = z
            .object({
              date: dateSchema,
              store: userSchema,
              amount: amountSchema,
            })
            .safeParse(payload);
          if (parsedFields.success) dispatch(payload);
          else setErrors(parsedFields.error.flatten().fieldErrors);
        }}
      >
        <h1 className="select-none text-center text-lg text-primary-500 md:text-xl">
          Add purchase
        </h1>
        <Input
          min={"2000-01-01"}
          max={todayString}
          className="pr-0"
          autoComplete="off"
          label="Date"
          id="date"
          name="date"
          type="date"
          required
          value={date}
          onChange={(e) => {
            const input = e.target.value;
            const newDate = new Date(input);
            if (dateSchema.safeParse(newDate).success) {
              if (errors.date) errors.date = undefined;
              if (years.includes(newDate.getFullYear())) {
                if (
                  years.length - yearWindowSize - yearIndex >
                  years.indexOf(Number(newDate.getFullYear()))
                )
                  setYearIndex(
                    years.length -
                      yearWindowSize -
                      years.indexOf(Number(newDate.getFullYear())),
                  );
                else if (
                  years.length - yearIndex - 1 <
                  years.indexOf(Number(newDate.getFullYear()))
                )
                  setYearIndex(
                    yearIndex -
                      (years.indexOf(Number(newDate.getFullYear())) -
                        (years.length - yearIndex - 1)),
                  );
                setSelectedYear(newDate.getFullYear());
              }
              setOpenMonth("");
              setCheckBoxOn(false);
            }
            setDate(input);
          }}
          errors={errors.date}
        />
        {stores.length > 0 ? (
          <div
            id="storesDiv"
            className="flex min-h-[80px] w-full items-center justify-start space-x-4 overflow-x-auto overscroll-contain p-4"
            onWheel={(e) => {
              const storesDiv = document.querySelector("#storesDiv");
              if (storesDiv) {
                if (e.deltaY > 0) storesDiv.scrollLeft += 30;
                else storesDiv.scrollLeft -= 30;
              }
            }}
          >
            {stores.map((s) => (
              <p
                className={`cursor-pointer rounded-full bg-dark-200 px-4 py-2 hover:bg-dark-300 ${
                  store === s ? "text-primary-500" : ""
                }`}
                key={s}
                onClick={() => setStore(s)}
              >
                {s}
              </p>
            ))}
          </div>
        ) : (
          <></>
        )}
        <Input
          autoComplete="off"
          label="Store"
          placeholder="store"
          id="store"
          name="store"
          type="text"
          required
          value={store}
          onChange={(e) => {
            const input = e.target.value.trim();
            if (errors.store && userSchema.safeParse(input).success)
              errors.store = undefined;
            setStore(input);
          }}
          errors={errors.store}
        />

        <Input
          min={1}
          max={1000000}
          step={0.01}
          autoComplete="off"
          label="Amount"
          placeholder="0 - 999,999"
          id="amount"
          name="amount"
          type="number"
          inputMode="decimal"
          required
          value={amount === 0 ? "" : amount}
          onChange={(e) => {
            const input = e.target.value;
            if (/^[0-9]{0,7}(\.[0-9]{0,2})?$/.test(input)) {
              if (
                errors.amount &&
                amountSchema.safeParse(Number(input)).success
              )
                errors.amount = undefined;
              setAmount(Number(input));
            }
          }}
          errors={errors.amount}
        />
        <button className="btn">Submit</button>
      </form>
    </>
  );
}
