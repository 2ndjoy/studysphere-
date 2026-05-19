import Skeleton from "react-loading-skeleton";

function DashboardSkeleton() {

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

      {[1, 2, 3, 4].map((item) => (

        <div
          key={item}
          className="bg-gray-100 dark:bg-[#1e293b] rounded-2xl p-6"
        >

          <Skeleton
            height={20}
            width={100}
          />

          <div className="mt-4">

            <Skeleton
              height={45}
              width={80}
            />

          </div>

        </div>
      ))}

    </div>
  );
}

export default DashboardSkeleton;